import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  {
    name: "Igiraneza Sheilla",
    role: "Managing Director",
    company: "Global Children Support Africa",
    image: "https://keonline.eu-central-1.linodeobjects.com/uploads/logo/SuCvwRANFeUwRViEcFhwRRGeg1Xj9RzaEGUUrk03.jpg",
    rating: 5,
    text: "Afriton has completely transformed how we handle cross-border payments. The efficiency and security provided are unmatched in the industry.",
  },
  {
    name: "Mugishawimana Elvine",
    role: "CEO",
    company: "TechVentures Nigeria",
    image: "https://media.licdn.com/dms/image/v2/D5603AQHHDd1NwniZnQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1728319363968?e=2147483647&v=beta&t=LXgerx72K8YIZ2ihvUSygC_bmpmfXJs1cwAHH_JOCig",
    rating: 5,
    text: "The integration process was seamless, and the customer support team was exceptional. Afriton has significantly improved our payment operations.",
  },
  {
    name: "Munezero Grace",
    role: "Operations Manager",
    company: "International Trade Co.",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQEDFibeQWpu0g/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1719068056166?e=2147483647&v=beta&t=f-EDnlnIp7RELjQNeHdMHYDfu9FB1XIIr-keY1qiUQ8",
    rating: 5,
    text: "We've reduced our transaction times by 70% since switching to Afriton. The platform's reliability and transparency are exceptional.",
  },
  {
    name: "Daniel Iryivuze",
    role: "CEO (Founder)",
    company: "Iga Trival",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQHqqKf0hk9ekw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1712904260820?e=2147483647&v=beta&t=sjWpZisZa7xLZV4N-N2n-jjjzHR8U_tKk0NnNsYYbtM",
    rating: 5,
    text: "The real-time tracking and competitive rates have made Afriton our go-to solution for all cross-border transactions.",
  },
  {
    name: "Vanessa Uwonkunda",
    role: "ChairWomen (Founder)",
    company: "Tech Innovations Rw",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQH4nmL4Va8bfg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1695463386404?e=2147483647&v=beta&t=7D-ZHoiuXZjbrvOFBQIyc5UBKVK6F6tQsJr_oqGFREc",
    rating: 5,
    text: "The real-time tracking and competitive rates have made Afriton our go-to solution for all cross-border transactions.",
  },
  {
    name: "Alain Muhirwa Michaele",
    role: "CEO",
    company: "PARAGON MEDI",
    image: "https://lscblack.github.io/images/Team/micheal.jpeg",
    rating: 5,
    text: "The real-time tracking and competitive rates have made Afriton our go-to solution for all cross-border transactions.",
  },
  {
    name: "Nayituraki Patrick",
    role: "CEO (Founder)",
    company: "Music Hub RW",
    image: "https://lscblack.github.io/images/img/life2.jpeg",
    rating: 5,
    text: "The real-time tracking and competitive rates have made Afriton our go-to solution for all cross-border transactions.",
  }
];

const TestimonialCard = ({ testimonial }) => (
  <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
          <p className="text-yellow-600">{testimonial.role}</p>
          <p className="text-gray-400 text-sm">{testimonial.company}</p>
        </div>
      </div>
      <FaQuoteLeft className="text-3xl text-yellow-600 opacity-50" />
    </div>
    <div className="mb-4">
      <div className="flex gap-1 mb-3">
        {[...Array(testimonial.rating)].map((_, index) => (
          <FaStar key={index} className="text-yellow-600" />
        ))}
      </div>
      <p className="text-gray-300 italic">{testimonial.text}</p>
    </div>
  </div>
);

export const UserFeedback = () => {
  const splideOptions = {
    perPage: 3,
    perMove: 1,
    gap: '1.5rem',
    pagination: true,
    arrows: true,
    breakpoints: {
      1024: {
        perPage: 2,
      },
      640: {
        perPage: 1,
      },
    },
    classes: {
      arrows: 'splide__arrows custom-arrows',
      arrow: 'splide__arrow custom-arrow',
      pagination: 'splide__pagination custom-pagination',
    },
  };

  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover why businesses across Africa trust Afriton for their cross-border payment needs
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="testimonials-slider">
          <style>
            {`
              .custom-arrow {
                background: rgba(255, 255, 255, 0.1) !important;
                opacity: 1 !important;
                width: 3rem !important;
                height: 3rem !important;
                transition: all 0.3s ease !important;
              }
              .custom-arrow:hover {
                background: rgba(255, 255, 255, 0.2) !important;
              }
              .custom-arrow svg {
                fill: white !important;
              }
              .splide__pagination__page {
                background: rgba(255, 255, 255, 0.3) !important;
                margin: 0 6px !important;
                transition: all 0.3s ease !important;
              }
              .splide__pagination__page.is-active {
                background: #ca8a04 !important; /* yellow-600 */
                transform: scale(1.2) !important;
              }
              .splide__pagination {
                margin-top: 2rem !important;
              }
            `}
          </style>
          <Splide options={splideOptions}>
            {testimonials.map((testimonial, index) => (
              <SplideSlide key={index}>
                <TestimonialCard testimonial={testimonial} />
              </SplideSlide>
            ))}
          </Splide>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-300 mb-6">
            Join thousands of satisfied businesses using Afriton
          </p>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserFeedback;