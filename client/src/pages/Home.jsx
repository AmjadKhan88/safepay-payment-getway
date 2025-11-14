import React from "react";
import Hero from "../components/Hero";
import Card from "../components/Card";

function Home() {
  const cards = [
    {
        id: 1,
        name: "Casual Shoes",
        category: "Sports",
        price: 100,
        offerPrice: 80,
        rating: 4,
        image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImageWithoutBg.png",
    },
    {
        id:2,
        name: "Manerl Shoes",
        category: "Sports",
        price: 200,
        offerPrice: 90,
        rating: 4,
        image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImageWithoutBg.png",
    },
    {
        id:3,
        name: "Sample Shoes",
        category: "Sports",
        price: 50,
        offerPrice: 30,
        rating: 4,
        image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImageWithoutBg.png",
    },
    {
        id:4,
        name: "Modern Shoes",
        category: "Sports",
        price: 600,
        offerPrice: 150,
        rating: 4,
        image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImageWithoutBg.png",
    }
  ];
  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* <!-- Card --> */}
          {cards.map((card)=>(
            <Card key={card.name} product={card}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
