-- supabase/migrations/007_create_update_trip_stops_order_function.sql
CREATE OR REPLACE FUNCTION update_trip_stops_order(trip_id_param uuid, stops_data jsonb)
RETURNS void AS $$
BEGIN
  FOR stop_data IN SELECT * FROM jsonb_to_recordset(stops_data) AS x(id uuid, stop_order integer)
  LOOP
    UPDATE trip_stops
    SET stop_order = stop_data.stop_order
    WHERE id = stop_data.id AND trip_id = trip_id_param;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
