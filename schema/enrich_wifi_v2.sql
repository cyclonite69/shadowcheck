-- Extended enriched view: keeps Wi-Fi logic, adds cell parsing & flags.
-- Does NOT replace app.location_details_enriched (v1); creates v2 alongside.

drop view if exists app.location_details_enriched_v2;

create view app.location_details_enriched_v2 as
select
  d.*,

  -- Wi-Fi derived fields
  case when d.frequency_at_time between 2400 and 7125
       then d.frequency_at_time end as frequency_mhz,
  case when d.frequency_at_time between 2400 and 7125
       then app.wifi_channel(d.frequency_at_time) end as channel,
  case when d.frequency_at_time between 2400 and 7125
       then app.wifi_band(d.frequency_at_time) end as band,

  -- Heuristics: what does the bssid look like?
  (d.bssid ~* '^[0-9a-f]{2}(:[0-9a-f]{2}){5}$') as looks_like_mac,
  (d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+(_[0-9]+)?$') as looks_like_cell_id,

  -- Explicit Wi-Fi/BT BSSIDs
  case when d.radio_short in ('WiFi','BT')
       and d.bssid ~* '^[0-9a-f]{2}(:[0-9a-f]{2}){5}$'
       then d.bssid end as bssid_mac,

  -- Parsed Cell components (if underscore-separated format)
  case when d.radio_short like 'Cell%' and d.bssid ~ '^[0-9]+_' then split_part(d.bssid,'_',1)::int    end as cell_mcc,
  case when d.radio_short like 'Cell%' and d.bssid ~ '^[0-9]+_' then split_part(d.bssid,'_',2)::int    end as cell_mnc,
  case when d.radio_short like 'Cell%' and d.bssid ~ '^[0-9]+_' then split_part(d.bssid,'_',3)::bigint end as cell_area,
  case when d.radio_short like 'Cell%' and d.bssid ~ '^[0-9]+_' then split_part(d.bssid,'_',4)::bigint end as cell_cell,
  case when d.radio_short like 'Cell%' then d.radio_short end as cell_tech

from app.location_details_asof d;
