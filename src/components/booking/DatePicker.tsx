"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  addDays,
  checkDateAvailability,
  earliestBookableDate,
  formatLongDate,
  fromISODate,
  isDateBookable,
  latestBookableDate,
  toISODate,
} from "@/lib/booking/dates";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * ===========================================================================
 * DATE PICKER — the inline calendar from the design
 * ===========================================================================
 * A calendar is the single most-often-broken widget on the accessible web, so
 * this one follows the ARIA Authoring Practices "date grid" pattern exactly:
 *
 *   role="grid"          the month is a real grid of days, announced as a
 *                        table with rows and columns.
 *   ROVING TABINDEX      only ONE day is ever in the tab order. Tab moves you
 *                        into and straight out of the calendar; the ARROW KEYS
 *                        move between days. Without this you would have to
 *                        press Tab up to 31 times to escape a single month.
 *   aria-selected        on the gridcell, plus aria-current="date" and the
 *                        word "selected" in the day's accessible name — so the
 *                        chosen day is never signalled by the dark circle
 *                        alone (WCAG 1.4.1 Use of Colour). It also gets a ✓.
 *   aria-disabled        Mondays and out-of-range days stay focusable but
 *                        cannot be chosen, so a keyboard user can still read
 *                        WHY a day is unavailable instead of it vanishing.
 *   aria-live            a polite region announces the selection and every
 *                        month change.
 *
 * KEYBOARD MAP
 *   ← →            previous / next day
 *   ↑ ↓            previous / next week
 *   Home / End     first / last day of the week
 *   PageUp/Down    previous / next month
 *   Enter / Space  choose the focused day
 * ===========================================================================
 */

type DatePickerProps = {
  /** Currently chosen date as "YYYY-MM-DD", or "" when nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  dict: Dictionary;
  locale: Locale;
  /** Wired up by <Field> so the label and any error are announced. */
  describedBy?: string;
  invalid?: boolean;
  /** The id the error summary links to — must land on a focusable element. */
  id: string;
};

export function DatePicker({
  value,
  onChange,
  dict,
  locale,
  describedBy,
  invalid,
  id,
}: DatePickerProps) {
  const t = dict.booking.calendar;
  const liveRegionId = useId();

  const firstBookable = earliestBookableDate();
  const lastBookable = latestBookableDate();

  /**
   * `focusedDate` is where the keyboard cursor is; `value` is what has been
   * chosen. They are deliberately separate — you can move around the calendar
   * reading dates without committing to one.
   */
  const [focusedDate, setFocusedDate] = useState<string>(() => value || firstBookable);
  /** Set to true only by keyboard/arrow movement, so we never steal focus on load. */
  const shouldRestoreFocus = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keep the cursor in step if the date is changed from outside (e.g. the
  // visitor pressed "Back" on the review step).
  useEffect(() => {
    if (value) setFocusedDate(value);
  }, [value]);

  // After an arrow key moves the cursor, move real DOM focus to match.
  useEffect(() => {
    if (!shouldRestoreFocus.current) return;
    shouldRestoreFocus.current = false;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)
      ?.focus();
  }, [focusedDate]);

  /** The weeks of the month currently on screen, as a 2-D array of ISO dates. */
  const { weeks, monthLabel, viewYear, viewMonth } = useMemo(() => {
    const cursor = fromISODate(focusedDate);
    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const firstOfMonth = new Date(year, month, 1, 12);
    // Back up to the Sunday on or before the 1st, so every row has 7 cells.
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(1 - firstOfMonth.getDay());

    const rows: string[][] = [];
    const day = new Date(gridStart);
    for (let week = 0; week < 6; week += 1) {
      const row: string[] = [];
      for (let index = 0; index < 7; index += 1) {
        row.push(toISODate(day));
        day.setDate(day.getDate() + 1);
      }
      rows.push(row);
      // Stop early when the next row would be entirely in the following month.
      if (day.getMonth() !== month && day.getDate() > 7) break;
    }

    return {
      weeks: rows,
      monthLabel: `${t.months[month]} ${year}`,
      viewYear: year,
      viewMonth: month,
    };
  }, [focusedDate, t.months]);

  /** Move the keyboard cursor, clamped to the bookable window. */
  function moveFocus(days: number) {
    const next = addDays(focusedDate, days);
    if (next < firstBookable || next > lastBookable) return;
    shouldRestoreFocus.current = true;
    setFocusedDate(next);
  }

  function moveMonth(delta: number) {
    const cursor = fromISODate(focusedDate);
    const moved = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1, 12);
    // Keep the same day-of-month where possible, otherwise land on the 1st.
    const sameDay = new Date(
      moved.getFullYear(),
      moved.getMonth(),
      Math.min(cursor.getDate(), new Date(moved.getFullYear(), moved.getMonth() + 1, 0).getDate()),
      12,
    );
    const clamped =
      toISODate(sameDay) < firstBookable
        ? firstBookable
        : toISODate(sameDay) > lastBookable
          ? lastBookable
          : toISODate(sameDay);
    shouldRestoreFocus.current = true;
    setFocusedDate(clamped);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => moveFocus(-1),
      ArrowRight: () => moveFocus(1),
      ArrowUp: () => moveFocus(-7),
      ArrowDown: () => moveFocus(7),
      Home: () => moveFocus(-fromISODate(focusedDate).getDay()),
      End: () => moveFocus(6 - fromISODate(focusedDate).getDay()),
      PageUp: () => moveMonth(-1),
      PageDown: () => moveMonth(1),
    };

    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isDateBookable(focusedDate)) onChange(focusedDate);
    }
  }

  /** Can we still page backwards / forwards without leaving the window? */
  const canGoPrevious = toISODate(new Date(viewYear, viewMonth, 0, 12)) >= firstBookable;
  const canGoNext = toISODate(new Date(viewYear, viewMonth + 1, 1, 12)) <= lastBookable;

  return (
    <div
      className={[
        "inline-block w-full max-w-[330px] rounded-xl border bg-white/90 p-3 shadow-card",
        invalid ? "border-2 border-danger" : "border-line",
      ].join(" ")}
    >
      {/* ---------------------------- Month header ---------------------------- */}
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="font-serif text-[15px] font-semibold text-ink">
          {monthLabel}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            disabled={!canGoPrevious}
            aria-label={t.previousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-surface-parchment disabled:opacity-40"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            disabled={!canGoNext}
            aria-label={t.nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-surface-parchment disabled:opacity-40"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      {/* ------------------------- Current selection -------------------------- */}
      {/* aria-live="polite" waits for a pause, so it never talks over the
          visitor while they are still moving around the grid. */}
      <p
        id={liveRegionId}
        aria-live="polite"
        className="flex items-center gap-2 border-b border-line-soft px-1 pb-2 font-sans text-[13px] text-ink"
      >
        <span aria-hidden="true" className="text-brand-green">
          ●
        </span>
        <span>
          {t.selectedPrefix}{" "}
          <strong className="font-semibold">
            {value ? formatLongDate(value, locale) : t.noDateChosen}
          </strong>
        </span>
      </p>

      {/* ------------------------------- Grid --------------------------------- */}
      <div
        ref={gridRef}
        role="grid"
        id={id}
        aria-label={t.label}
        aria-describedby={describedBy}
        onKeyDown={handleKeyDown}
        className="mt-2 select-none"
      >
        {/* Column headers. `abbr` gives the full weekday name to screen
            readers while the visible text stays a single letter. */}
        <div role="row" className="grid grid-cols-7">
          {t.weekdaysNarrow.map((narrow, index) => (
            <div
              key={index}
              role="columnheader"
              aria-label={t.weekdaysShort[index]}
              className="py-1 text-center font-sans text-[11px] font-medium text-brand-brown-soft"
            >
              <abbr title={t.weekdaysShort[index]} className="no-underline">
                {narrow}
              </abbr>
            </div>
          ))}
        </div>

        {weeks.map((week) => (
          <div role="row" key={week[0]} className="grid grid-cols-7">
            {week.map((date) => {
              const dayNumber = fromISODate(date).getDate();
              const inCurrentMonth = fromISODate(date).getMonth() === viewMonth;
              const reason = checkDateAvailability(date);
              const bookable = reason === null;
              const isSelected = value === date;
              const isCursor = focusedDate === date;

              /* The full sentence a screen reader reads for this cell, e.g.
                 "15 August 2026, closed" or "16 August 2026, selected". */
              const spokenLabel = [
                formatLongDate(date, locale),
                isSelected ? t.selected : null,
                reason === "closed" ? t.closedSuffix : null,
                reason === "too-soon" || reason === "too-far" ? t.unavailableSuffix : null,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                /* `aria-selected` belongs on the GRIDCELL, not on the button
                   inside it — a button role does not support that attribute.
                   The button carries `aria-current="date"` instead, and its
                   accessible name already ends with "selected". */
                <div
                  role="gridcell"
                  aria-selected={isSelected}
                  key={date}
                  className="p-0.5"
                >
                  <button
                    type="button"
                    data-date={date}
                    /* ROVING TABINDEX: exactly one 0 per grid. */
                    tabIndex={isCursor ? 0 : -1}
                    aria-label={spokenLabel}
                    aria-current={isSelected ? "date" : undefined}
                    aria-disabled={!bookable}
                    onFocus={() => setFocusedDate(date)}
                    onClick={() => {
                      if (bookable) onChange(date);
                    }}
                    className={[
                      "flex h-9 w-full items-center justify-center rounded-md font-sans text-[13px] transition-colors",
                      isSelected
                        ? "bg-brand-green font-bold text-white"
                        : bookable
                          ? "text-ink hover:bg-surface-parchment"
                          : // Unavailable: dimmed AND struck through, so the
                            // state is never colour-only.
                            "cursor-not-allowed text-brand-brown-soft/70 line-through",
                      !inCurrentMonth && !isSelected ? "opacity-45" : "",
                    ].join(" ")}
                  >
                    {/* The ✓ is the non-colour signal for "chosen". */}
                    {isSelected && <span aria-hidden="true" className="mr-0.5 text-[10px]">✓</span>}
                    {dayNumber}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-2 px-1 font-sans text-[11px] leading-snug text-brand-brown-soft">
        {t.keyboardHint}
      </p>
    </div>
  );
}
