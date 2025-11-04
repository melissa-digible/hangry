# Hangry - Find Your Next Meal 🍽️

A Tinder-style food discovery app that helps you decide what to eat by swiping through restaurant options from Yelp and Google Places, with recipe suggestions for cooking at home.

## Features

- 🎯 **Tinder-style Swiping**: Swipe through restaurant food images and rate them as Yum, Maybe, or Yuck
- 🏪 **Restaurant Discovery**: Browse restaurants from Yelp API with photos, ratings, and cuisine types
- 🎨 **Smart Recommendations**: Get suggestions for similar restaurants based on your preferences
- 👨‍🍳 **Recipe Suggestions**: Find matching recipes to cook at home instead of dining out
- 📱 **Beautiful UI**: Modern, responsive design with smooth animations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Yelp Fusion API key (optional, app works with mock data)
- Spoonacular API key (optional, app works with mock data)

### Installation

1. Clone or navigate to the project directory:
```bash
cd "~Projects:hangry"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional, for API integrations):
```env
VITE_YELP_API_KEY=your_yelp_api_key_here
VITE_SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

### Getting API Keys

#### Yelp Fusion API
1. Visit [Yelp Fusion API](https://www.yelp.com/developers)
2. Create a developer account
3. Create a new app to get your API key
4. Add it to your `.env` file as `VITE_YELP_API_KEY`

#### Spoonacular API
1. Visit [Spoonacular API](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file as `VITE_SPOONACULAR_API_KEY`

**Note**: The app works with mock data if you don't have API keys, so you can start using it right away!

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## How to Use

1. **Swipe Through Restaurants**: 
   - Swipe left (or click "Yuck") to reject
   - Click "Maybe" for neutral
   - Swipe right (or click "Yum") to like

2. **View Your Options**:
   - Click "Show My Options" button at any time
   - See all restaurants you marked as "Yum"
   - Browse similar restaurants based on your preferences
   - Check out recipe suggestions for cooking at home

3. **Explore Recipes**:
   - Switch to the "Recipes" tab in the options view
   - Find recipes that match your preferred cuisine types
   - Click on recipe links to view full instructions

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client for API calls
- **Yelp Fusion API** - Restaurant data
- **Spoonacular API** - Recipe data

## Project Structure

```
hangry/
├── src/
│   ├── components/       # React components
│   │   ├── FoodCard.tsx  # Swipeable restaurant card
│   │   └── OptionsView.tsx # Options and recipes view
│   ├── services/         # API services
│   │   └── api.ts        # Restaurant and recipe APIs
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   ├── App.css           # Main app styles
│   └── main.tsx          # Entry point
├── index.html
├── package.json
└── README.md
```

## License

MIT

