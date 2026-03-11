-- WanderGuide: Part 4 - Events Seed Data
BEGIN;

-- ── 3. Events ────────────────────────────────────────────────────────
INSERT INTO public.events (name, description, city, state, event_date, end_date, category)
VALUES
  ('Diwali Festival of Lights', 'India''s biggest festival of lights celebrated with fireworks, diyas, and sweets across Rajasthan.', 'Jaipur', 'Rajasthan', '2026-10-20', '2026-10-25', 'festival'),
  ('Pushkar Camel Fair', 'One of the world''s largest camel fairs with livestock trading, cultural performances, and desert camping.', 'Pushkar', 'Rajasthan', '2026-11-05', '2026-11-13', 'cultural'),
  ('Hornbill Festival', 'Festival of Festivals showcasing Naga tribal culture, traditional dances, music, and indigenous games.', 'Kohima', 'Nagaland', '2026-12-01', '2026-12-10', 'festival'),
  ('Holi Festival', 'The vibrant festival of colors celebrated with special fervor in Lord Krishna''s birthplace.', 'Mathura', 'Uttar Pradesh', '2027-03-14', '2027-03-15', 'festival'),
  ('Onam', 'Kerala''s harvest festival featuring elaborate boat races, floral carpets, and traditional Onam Sadhya feast.', 'Kochi', 'Kerala', '2026-09-10', '2026-09-20', 'festival'),
  ('Rann Utsav', 'A three-month cultural extravaganza on the white salt desert of Kutch with folk performances and crafts.', 'Bhuj', 'Gujarat', '2026-11-01', '2027-02-28', 'cultural'),
  ('Durga Puja', 'Kolkata''s grandest festival with elaborate pandals, idol immersions, and cultural celebrations.', 'Kolkata', 'West Bengal', '2026-10-01', '2026-10-05', 'festival'),
  ('Ganesh Chaturthi', 'Mumbai''s iconic 10-day celebration of Lord Ganesha with massive public installations and processions.', 'Mumbai', 'Maharashtra', '2026-09-17', '2026-09-27', 'festival'),
  ('Pongal', 'Tamil Nadu''s four-day harvest festival with traditional kolam designs, cattle races, and sweet pongal cooking.', 'Madurai', 'Tamil Nadu', '2027-01-14', '2027-01-17', 'festival'),
  ('Cherry Blossom Festival', 'India''s only cherry blossom festival showcasing beautiful pink blooms across Shillong''s hillsides.', 'Shillong', 'Meghalaya', '2026-11-15', '2026-11-17', 'nature'),
  ('Ziro Music Festival', 'An outdoor music festival in the stunning Ziro Valley featuring indie and world music acts.', 'Ziro', 'Arunachal Pradesh', '2026-09-25', '2026-09-28', 'music'),
  ('Kumbh Mela', 'The world''s largest spiritual gathering at the confluence of the Ganga and Yamuna rivers.', 'Allahabad', 'Uttar Pradesh', '2027-01-13', '2027-02-26', 'festival'),
  ('International Kite Festival', 'A spectacular display of kites from around the world celebrating Uttarayan/Makar Sankranti.', 'Ahmedabad', 'Gujarat', '2027-01-14', '2027-01-14', 'cultural'),
  ('Mysore Dasara', 'A 10-day royal celebration in Mysore Palace with illuminated processions and cultural events.', 'Mysore', 'Karnataka', '2026-10-12', '2026-10-21', 'festival'),
  ('Hemis Festival', 'A vibrant Buddhist festival at Hemis Monastery featuring masked dances and traditional Ladakhi music.', 'Leh', 'Ladakh', '2026-06-20', '2026-06-21', 'cultural');

COMMIT;

