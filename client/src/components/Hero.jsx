import React from "react";

function Hero() {
  return (
    <>
      <div class="relative flex flex-col items-center justify-center text-sm px-4 md:px-16 lg:px-24 pb-10 xl:px-32 bg-slate-100 text-gray-700">
        <div class="absolute top-28 -z-1 left-1/4 size-72 bg-purple-600 blur-[300px]"></div>

        <h1 class="text-5xl leading-[68px] md:text-6xl md:leading-[84px] font-medium max-w-2xl text-center">
          Order your faverite products
          <span class=" text-purple-500 px-3 rounded-xl text-nowrap">
            Fastly From Us.
          </span>
        </h1>

        <div class="flex flex-wrap justify-center items-center gap-4 md:gap-14 mt-12">
          <p class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-check-icon lucide-check size-5 text-purple-600"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span class="text-slate-400">Using credit card</span>
          </p>
          <p class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-check-icon lucide-check size-5 text-purple-600"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span class="text-slate-400">Easy to buy</span>
          </p>
          <p class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-check-icon lucide-check size-5 text-purple-600"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span class="text-slate-400">3 day delivery</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Hero;
