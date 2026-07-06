import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCalendarDays, getDateSummary } from "../utils/dateHelpers";
import { format, isSameMonth, isToday, addMonths, subMonths } from "date-fns";

export default function MiniCalendar({
  monthDate,
  onChangeMonth,
  onSelectDate,
  selectedDate,
  monthTasks,
}) {
  const days = getCalendarDays(monthDate);
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div>
      <div className="cal-header">
        <h2>{format(monthDate, "MMMM yyyy")}</h2>
        <div className="cal-nav">
          <button onClick={() => onChangeMonth(subMonths(monthDate, 1))}>
            <ChevronLeft />
          </button>
          <button onClick={() => onChangeMonth(addMonths(monthDate, 1))}>
            <ChevronRight />
          </button>
        </div>
      </div>
      <div className="cal-grid">
        {dayNames.map((d) => (
          <div key={d} className="cal-day-name">
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          const ds = format(d, "yyyy-MM-dd");
          const sum = getDateSummary(monthTasks || [], ds);
          const isOther = !isSameMonth(d, monthDate);
          const isSel = selectedDate === ds;
          const isTd = isToday(d);
          let dotClass = "";
          if (sum.rate === -1) dotClass = "";
          else if (sum.rate === 1) dotClass = "dot-complete";
          else if (sum.rate > 0) dotClass = "dot-partial";
          else dotClass = "dot-none";

          return (
            <div
              key={i}
              className={
                "cal-day" +
                (isOther ? " other-month" : "") +
                (isTd ? " today" : "") +
                (isSel ? " selected" : "")
              }
              onClick={() => onSelectDate(ds)}
            >
              {format(d, "d")}
              {dotClass && <span className={"cal-dot " + dotClass}></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
