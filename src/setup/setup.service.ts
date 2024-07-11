import countries from '../json/countries.json';
import states from '../json/states.json';
import cities from '../json/cities.json';

interface Country {
  id: number;
  name: string;
  emoji: string;
  emojiU: string;
}

interface State {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

export const getCountries = (): Country[] => {
  return countries.map((country) => {
    return {
      id: country.id,
      name: country.name,
      emoji: country.emoji,
      emojiU: country.emojiU,
    };
  });
};

export const getStatesByCountryId = (countryId: number): State[] => {
  return states.flatMap((state) => {
    if (state.country_id === countryId) {
      return [
        {
          id: state.id,
          name: state.name,
        },
      ];
    }
    return [];
  });
};

export const getCitiesByStateId = (stateId: number): City[] => {
  return (cities as (City & { state_id: number })[]).flatMap((city) => {
    if (city.state_id === stateId) {
      return [
        {
          id: city.id,
          name: city.name,
        },
      ];
    }
    return [];
  });
};

export const getCitiesByCountryId = (countryId: number) => {
  return (cities as (City & { country_id: number })[]).flatMap((city) => {
    if (city.country_id === countryId) {
      return [
        {
          id: city.id,
          name: city.name,
        },
      ];
    }
    return [];
  });
};
