-- ============================================================
-- WiFi helpers + enriched view
-- Safe to re-run. Requires schema: app
-- ============================================================

-- Helpers -----------------------------------------------------
create or replace function app.wifi_band(freq_mhz int)
returns text language sql immutable as $$
  select case
    when $1 between 2400 and 2500 then '2.4GHz'
    when $1 between 4900 and 5925 then '5GHz'
    when $1 between 5925 and 7125 then '6GHz'
    else null
  end
$$;

create or replace function app.wifi_channel(freq_mhz int)
returns int language sql immutable as $$
  -- 2.4GHz: ch1=2412 + 5*(n-1); JP ch14=2484
  -- 5GHz: chN => 5000 + 5*N (common 36,40,...,165)
  -- 6GHz: chN => 5950 + 5*N (1..233)
  select case
    when $1 is null then null
    when $1 = 2484 then 14
    when $1 between 2401 and 2499 then ((($1 - 2412) / 5)::int) + 1
    when $1 between 4900 and 5925 then (($1 - 5000) / 5)::int
    when $1 between 5925 and 7125 then (($1 - 5950) / 5)::int
    else null
  end
$$;

create or replace function app.wifi_freq_from_channel(ch int)
returns int language sql immutable as $$
  select case
    when ch is null then null
    when ch = 14 then 2484                                  -- 2.4 JP special
    when ch between 1 and 13 then 2412 + 5*(ch-1)           -- 2.4GHz
    when ch between 1 and 233 then 5950 + 5*ch              -- prefer 6GHz first
    else 5000 + 5*ch                                        -- fallback 5GHz (36..165, etc.)
  end
$$;

-- Enriched view ----------------------------------------------
drop view if exists app.location_details_enriched;

create view app.location_details_enriched as
select
  d.*,
  /* frequency_mhz is the canonical derived frequency. If your
     base table later adds channel_at_time, you can swap in
     coalesce(d.frequency_at_time, app.wifi_freq_from_channel(d.channel_at_time)) */
  d.frequency_at_time                                   as frequency_mhz,
  app.wifi_channel(d.frequency_at_time)                 as channel,
  case
    when d.frequency_at_time between 2400 and 7125
      then app.wifi_band(d.frequency_at_time)
    else null
  end                                                  as band
from app.location_details_asof d;

-- Optional: tighten column types if needed via a materialized view/table.
-- This view keeps original types from app.location_details_asof.

