import Movie from "../types/Movie";

// Import images for movies
import firstImage from './movies/first.png';
import secondImage from './movies/second.png';
import thirdImage from './movies/third.png';
import fourthImage from './movies/fourth.png';
import fifthImage from './movies/fifth.png';
import sixthImage from './movies/sixth.png';

const movies: Movie[] = [
    {
      id: "1",
      title: 'Le ali della libertà',
      year: "1994",
      rating: "9.3",
      categories: ['Drammatico'],
      ageRating: 'R',
      imageUrl: firstImage,
    },
    {
      id: "2",
      title: 'Il Padrino',
      year: "1972",
      rating: "9.2",
      categories: ['Noir', 'Drammatico', 'Gangster'],
      ageRating: 'R',
      imageUrl: secondImage,
    },
    {
      id: "3",
      title: 'Il Padrino - Parte II',
      year: "1974",
      rating: "9.0",
      categories: ['Drammatico', 'Gangster'],
      ageRating: 'R',
      imageUrl: thirdImage,
    },
    {
      id: "4",
      title: 'Il cavaliere oscuro',
      year: "2008",
      rating: "9.0",
      categories: ['Azione', 'Thriller', 'Drammatico'],
      ageRating: 'PG-13',
      imageUrl: fourthImage,
    },
    {
      id: "5",
      title: 'La parola ai giurati',
      year: "1957",
      rating: "8.9",
      categories: ['Drammatico'],
      ageRating: 'NR',
      imageUrl: fifthImage,
    },
    {
      id: "6",
      title: 'Schindler\'s List',
      year: "1993",
      rating: "8.9",
      categories: ['Biografico', 'Drammatico', 'Storico'],
      ageRating: 'R',
      imageUrl: sixthImage,
    },
];

export default movies;