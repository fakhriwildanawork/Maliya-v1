import React, { useState, useEffect, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, subDays, isSameDay, differenceInDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../logic/utils/classNames';
import { Button } from './Button';
import FixDropdown from './FixDropdown';
import { 
  BG_SURFACE, 
  RADIUS_DEFAULT, 
  BORDER_DEFAULT,
  BG_PRIMARY,
  RADIUS_PILL,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  TEXT_INVERSE,
  RADIUS_CARD
} from '../../styles/tokens';
import 'react-day-picker/style.css';

export interface DateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
  placeholder = "Pilih rentang tanggal",
}: DateRangePickerProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [internalDate, setInternalDate] = useState<DateRange | undefined>(date);
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    date?.to ? (isMobile ? date.to : subMonths(date.to, 1)) : new Date()
  );

  useEffect(() => {
    if (!showCalendar) {
      setInternalDate(date);
    }
  }, [date, showCalendar]);

  useEffect(() => {
    if (showCalendar && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCalendar, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (onDateChange) {
      if (internalDate?.from && !internalDate?.to) {
        onDateChange({ from: internalDate.from, to: internalDate.from });
      } else {
        onDateChange(internalDate);
      }
    }
    setShowCalendar(false);
  };

  const handleSelect = (range: DateRange | undefined, selectedDay: Date) => {
    if (internalDate?.from && internalDate?.to) {
      setInternalDate({ from: selectedDay, to: undefined });
    } else if (internalDate?.from && !internalDate?.to && isSameDay(internalDate.from, selectedDay)) {
      setInternalDate({ from: selectedDay, to: selectedDay });
    } else {
      setInternalDate(range);
    }
  };

  const today = new Date();
  const presets = [
    { label: "Hari Ini", range: { from: today, to: today } },
    { label: "Kemarin", range: { from: subDays(today, 1), to: subDays(today, 1) } },
    { label: "7 Hari Terakhir", range: { from: subDays(today, 6), to: today } },
    { label: "Bulan Ini", range: { from: startOfMonth(today), to: endOfMonth(today) } },
    { label: "30 Hari Terakhir", range: { from: subDays(today, 29), to: today } },
    { label: "3 Bulan Terakhir", range: { from: subMonths(startOfMonth(today), 2), to: today } },
  ];

  const isValidRange = !!internalDate?.from && (!internalDate.to || Math.abs(differenceInDays(internalDate.to, internalDate.from)) <= 92);

  // Hitung bulan berikutnya untuk tampilan header (karena 2 bulan)
  const nextMonth = addMonths(calendarMonth, 1);

  return (
    <div className={cn("relative", className)}>
     <Button
      variant="outline"
      onClick={() => {
        if (!showCalendar) {
          const referenceDate = internalDate?.to || internalDate?.from || new Date();
          setCalendarMonth(isMobile ? referenceDate : subMonths(referenceDate, 1));
        }
        setShowCalendar(!showCalendar);
      }}
      className="flex items-center gap-2 px-3 py-2 min-h-[44px] h-auto shadow-none font-medium"
    >
      <CalendarIcon size={16} className="text-gray-500" />
      
      <span className="text-sm">
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, "MMM dd, yyyy", { locale: localeId })} -{" "}
              {format(date.to, "MMM dd, yyyy", { locale: localeId })}
            </>
          ) : (
            format(date.from, "MMM dd, yyyy", { locale: localeId })
          )
        ) : (
          <span>{placeholder}</span>
        )}
      </span>
      
      <ChevronDown 
        size={16} 
        className={cn("transition-transform duration-200 ml-1", showCalendar && "rotate-180")} 
      />
    </Button>

      {showCalendar && (
        isMobile ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
            {/* Backdrop click listener */}
            <div 
              className="absolute inset-0" 
              onClick={() => setShowCalendar(false)} 
            />
            
            {/* Bottom Sheet Container */}
<div
  ref={calendarRef}
  className={cn(
    "relative z-10 w-full flex flex-col p-4 pb-6 rounded-t-3xl shadow-2xl border-t border-x animate-in slide-in-from-bottom duration-200", 
    BG_SURFACE,
    BORDER_DEFAULT
  )}
>
              {/* Drag Handle indicator for Bottom Sheet */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between mb-4 px-1">
                <span className={cn("text-base font-bold", TEXT_PRIMARY)}>Rentang Tanggal</span>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="text-sm text-gray-500 font-medium px-2 py-1 hover:text-gray-900 transition-colors"
                >
                  Batal
                </button>
              </div>

              {/* DayPicker and Month Navigation inside */}
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3 px-1">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                    className="p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className={cn("text-base font-semibold", TEXT_PRIMARY)}>
                    {format(calendarMonth, "MMMM yyyy", { locale: localeId })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                    className="p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <DayPicker
  mode="range"
  locale={localeId}
  selected={internalDate}
  onSelect={handleSelect}
  month={calendarMonth}
  onMonthChange={setCalendarMonth}
  numberOfMonths={1}
  disabled={{ after: new Date() }}
  max={93}
  showOutsideDays
  className="w-full flex justify-center" // Biarkan w-full, flex-nya untuk centerkan kalender di container
  classNames={{
    root: "!p-0 w-full max-w-[360px]", // TAMBAHKAN MAX-WIDTH AGAR GRID TIDAK MELEBAR TERLALU BESAR DI MOBILE
    months: "flex flex-col w-full",
    month: "space-y-4 w-full",
    month_caption: "hidden",
    nav: "hidden",
    month_grid: "w-full mx-auto border-separate border-spacing-y-1", // Biarkan w-full, tambahkan border-spacing agar jarak antar baris rapi
    // HAPUS "grid grid-cols-7", biarkan default dari react-day-picker
    weekdays: "flex w-full mb-2", 
    weekday: cn(TEXT_MUTED, "font-medium text-xs uppercase flex-1 flex items-center justify-center"), // Pakai flex-1 agar rata kanan kiri otomatis
    weeks: "flex flex-col w-full",
    // HAPUS "grid grid-cols-7", biarkan default flex-nya react-day-picker
    week: "flex w-full", 
    // HAPUS "w-full", pakai aspect-square agar tetap kotak namun tidak memaksa parent melebar
    day: "aspect-square flex-1 text-center text-xs p-0 flex items-center justify-center relative focus-within:z-20",
    day_button: cn(
      "h-full w-full max-w-[44px] max-h-[44px] p-0 font-medium rounded-full flex items-center justify-center transition-all text-sm",
      TEXT_PRIMARY,
      "hover:bg-gray-100"
    ),
    today: "text-green-600 font-bold",
    selected: cn(BG_PRIMARY, "text-white font-bold"),
    range_start: cn("rounded-l-full", BG_PRIMARY, "text-white"),
    range_end: cn("rounded-r-full", BG_PRIMARY, "text-white"),
    range_middle: "bg-green-50 !text-green-700 rounded-none",
    outside: "text-gray-300 opacity-50",
    disabled: "text-gray-200 cursor-not-allowed",
    hidden: "invisible",
  }}
  components={{
    Chevron: () => <></>,
  }}
/>
              </div>

              {/* Preset selection and Action buttons */}
              <div className={cn("flex flex-col gap-4 mt-6 pt-4 border-t", BORDER_DEFAULT)}>
                <div className="w-full px-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preset</label>
                  <FixDropdown 
                    options={presets.map(p => ({ label: p.label, value: p.label }))}
                    value={undefined}
                    placeholder="Pilih Preset"
                    onChange={(val) => {
                      const preset = presets.find(p => p.label === val);
                      if (preset) {
                        setInternalDate(preset.range);
                        setCalendarMonth(preset.range.to);
                      }
                    }}
                  />
                </div>
                
                <Button 
                  onClick={handleApply}
                  disabled={!isValidRange}
                  className="w-full py-3 min-h-[48px] text-base font-semibold"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={calendarRef}
            className={cn(
              "absolute top-full right-0 mt-2 z-50 flex flex-col p-4 shadow-lg border",
              BG_SURFACE,
              RADIUS_DEFAULT,
              BORDER_DEFAULT
            )}
          >
            {/* CUSTOM HEADER NAVIGATION */}
            {/* Menggunakan grid-cols-2 dan gap-6 agar posisi rata tengah persis di atas kolom kalender */}
            <div className={cn(
              "grid mb-4 grid-cols-2 gap-6"
            )}>
              {/* Bulan 1 */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                  className={cn("p-1.5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center", "hover:bg-gray-100")}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <span className={cn("text-sm font-semibold whitespace-nowrap", TEXT_PRIMARY)}>
                  {format(calendarMonth, "MMMM yyyy", { locale: localeId })}
                </span>
              </div>

              {/* Bulan 2 */}
              <div className="flex items-center justify-center gap-2">
                <span className={cn("text-sm font-semibold whitespace-nowrap", TEXT_PRIMARY)}>
                  {format(nextMonth, "MMMM yyyy", { locale: localeId })}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className={cn("p-1.5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center", "hover:bg-gray-100")}
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <DayPicker
              mode="range"
              locale={localeId}
              selected={internalDate}
              onSelect={handleSelect}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              max={93}
              showOutsideDays
              className="w-auto"
              classNames={{
                root: "!p-0", 
                months: "flex flex-row space-x-6",
                month: "space-y-4",
                month_caption: "hidden",
                nav: "hidden",
                month_grid: "w-full",
                weekdays: "flex w-full mb-2",
                weekday: cn(TEXT_MUTED, "w-9 font-medium text-[11px] uppercase flex items-center justify-center"),
                weeks: "space-y-1",
                week: "flex w-full",
                day: "h-9 w-9 text-center text-xs p-0 flex items-center justify-center relative focus-within:z-20",
                day_button: cn(
                  "h-9 w-9 p-0 font-medium rounded-full flex items-center justify-center transition-all text-xs",
                  TEXT_PRIMARY,
                  "hover:bg-gray-100"
                ),
                today: "text-green-600 font-bold",
                selected: cn(BG_PRIMARY, "text-white font-bold"),
                range_start: cn("rounded-l-full", BG_PRIMARY, "text-white"),
                range_end: cn("rounded-r-full", BG_PRIMARY, "text-white"),
                range_middle: "bg-green-50 !text-green-700 rounded-none",
                outside: "text-gray-300 opacity-50",
                disabled: "text-gray-200 cursor-not-allowed",
                hidden: "invisible",
              }}
              components={{
                Chevron: () => <></>,
              }}
            />
            
            <div className={cn("flex justify-end items-center gap-2 mt-4 pt-4 border-t", BORDER_DEFAULT)}>
              <div className="w-[180px]">
                <FixDropdown 
                  options={presets.map(p => ({ label: p.label, value: p.label }))}
                  value={undefined}
                  onChange={(val) => {
                    const preset = presets.find(p => p.label === val);
                    if (preset) {
                      setInternalDate(preset.range);
                      setCalendarMonth(subMonths(preset.range.to, 1));
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleApply}
                disabled={!isValidRange}
              >
                Confirm
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  );
}