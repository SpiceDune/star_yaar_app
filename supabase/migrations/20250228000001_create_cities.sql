-- Cities table for birth-place autocomplete.
-- Source: SimpleMaps World Cities (city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, id).
DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  country_code CHAR(2),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  population INTEGER,
  search_text TEXT
);

CREATE INDEX idx_cities_name_lower ON cities (LOWER(name));
CREATE INDEX idx_cities_search_text ON cities USING gin (to_tsvector('simple', COALESCE(search_text, '')));
CREATE INDEX idx_cities_population ON cities (population DESC NULLS LAST);

COMMENT ON TABLE cities IS 'World cities for birth-place autocomplete; seeded from SimpleMaps worldcities.csv';
