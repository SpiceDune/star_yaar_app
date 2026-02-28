import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CityOption {
  id: string | number;
  name: string;
  state: string;
  country: string;
  label: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export default function KundliForm({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'compact';
}) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [timeKnown, setTimeKnown] = useState(true);
  const [city, setCity] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cityQuery.trim().length < 2) {
      setCityOptions([]);
      return;
    }
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    cityDebounceRef.current = setTimeout(async () => {
      const query = cityQuery.trim();
      if (query.length < 2) {
        setCityLoading(false);
        return;
      }
      setCityLoading(true);
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) {
          console.error('[KundliForm] cities API error', res.status, data);
          setCityOptions([]);
          setCityLoading(false);
          return;
        }
        const list = Array.isArray(data) ? data : (data?.cities ?? []);
        setCityOptions(list);
        setCityDropdownOpen(list.length > 0);
      } catch (e) {
        console.error('[KundliForm] cities fetch failed', e);
        setCityOptions([]);
      } finally {
        setCityLoading(false);
      }
    }, 300);
    return () => {
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    };
  }, [cityQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const COOKIE_PREFIX = 'kundli_';
  const COOKIE_DAYS = 7;

  function setCookie(key: string, value: string) {
    document.cookie = `${COOKIE_PREFIX}${key}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_DAYS * 86400}; SameSite=Lax`;
  }
  function getCookie(key: string): string | null {
    const name = `${COOKIE_PREFIX}${key}=`;
    const parts = document.cookie.split(';');
    for (const part of parts) {
      const s = part.trim();
      if (s.startsWith(name)) return decodeURIComponent(s.slice(name.length));
    }
    return null;
  }

  useEffect(() => {
    setName((n) => getCookie('name') ?? n);
    setDob((d) => getCookie('dob') ?? d);
    setTime((t) => getCookie('time') ?? t);
    setCity((c) => getCookie('city') ?? c);
    setCityQuery((q) => getCookie('city') ?? q);
  }, []);

  const cityValue = city.trim() || cityQuery.trim();
  const isValid = name.trim() && dob && (timeKnown ? time : true) && cityValue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    try {
      setCookie('name', name.trim());
      setCookie('dob', dob);
      if (timeKnown && time) setCookie('time', time);
      else setCookie('time', '');
      setCookie('city', cityValue);
      const selectedOpt = cityOptions.find((o) => o.label === cityValue || o.name === cityValue);
      if (selectedOpt?.latitude != null && selectedOpt?.longitude != null) {
        setCookie('lat', String(selectedOpt.latitude));
        setCookie('lon', String(selectedOpt.longitude));
        if (selectedOpt.timezone) setCookie('tz', selectedOpt.timezone);
      }
      const params = new URLSearchParams({
        name: name.trim(),
        dob,
        ...(timeKnown && time && { time }),
        city: cityValue,
      });
      window.location.href = `/kundli?${params.toString()}`;
    } catch {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'w-full rounded-2xl border border-stone-200/80 bg-white shadow-lg p-4 md:p-6',
        variant === 'compact' && 'max-w-md md:max-w-xl lg:max-w-2xl mx-auto',
        variant === 'default' && 'max-w-2xl',
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Full Name
          </Label>
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-lg text-base border-stone-200 focus:border-stone-500 focus:ring-stone-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Date of Birth
          </Label>
          <Input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="h-12 rounded-lg text-base border-stone-200 focus:border-stone-500 focus:ring-stone-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Time of Birth
          </Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={!timeKnown}
            className="h-12 rounded-lg text-base border-stone-200 focus:border-stone-500 focus:ring-stone-500/20 disabled:opacity-60"
          />
          <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={!timeKnown}
              onChange={(e) => setTimeKnown(!e.target.checked)}
              className="rounded border-stone-300 text-stone-800 focus:ring-stone-500"
            />
            <span className="text-xs text-stone-500">I don't know my exact birth time</span>
          </label>
        </div>

        <div className="space-y-1.5" ref={cityDropdownRef}>
          <Label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Birth City
          </Label>
          <div className="relative">
            <Input
              placeholder="Start typing city name..."
              value={cityQuery || city}
              onChange={(e) => {
                setCityQuery(e.target.value);
                if (!e.target.value) setCity('');
              }}
              onFocus={() => cityOptions.length > 0 && setCityDropdownOpen(true)}
              className="h-12 rounded-lg text-base border-stone-200 focus:border-stone-500 focus:ring-stone-500/20"
              autoComplete="off"
            />
            {cityLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
            )}
            {cityDropdownOpen && cityOptions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-stone-200 bg-white shadow-lg">
                {cityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm hover:bg-stone-50 border-b border-stone-50 last:border-0 transition-colors"
                    onClick={() => {
                      setCity(opt.label);
                      setCityQuery(opt.label);
                      setCityOptions([]);
                      setCityDropdownOpen(false);
                    }}
                  >
                    <span className="font-medium text-stone-800">{opt.name}</span>
                    {(opt.state || opt.country) && (
                      <span className="text-stone-500 ml-1">
                        {[opt.state, opt.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isValid || loading}
        className="mt-6 w-full h-12 rounded-lg text-base font-semibold bg-stone-900 hover:bg-stone-800 text-white active:scale-[0.98] transition-all min-h-[44px]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
          </span>
        ) : (
          'Generate My Kundli'
        )}
      </Button>
    </form>
  );
}
