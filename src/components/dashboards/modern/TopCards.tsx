import CardBox from '../../shared/CardBox';
import iconConnect from 'src/assets/images/svgs/icon-connect.svg';
import iconSpeechBubble from 'src/assets/images/svgs/icon-speech-bubble.svg';
import iconFavorites from 'src/assets/images/svgs/icon-favorites.svg';
import iconMailbox from 'src/assets/images/svgs/icon-mailbox.svg';
import iconBriefcase from 'src/assets/images/svgs/icon-briefcase.svg';
import iconUser from 'src/assets/images/svgs/icon-user-male.svg';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from 'react-router';

import 'swiper/css';

const TopCards = () => {
  // ============================================================
  // MOCK DASHBOARD DATA
  // Replace these values later with API data
  // ============================================================

  const TopCardInfo = [
    {
      key: 'customers',
      title: 'Active Customers',
      desc: '2,450',
      subtitle: 'Customers',
      img: iconUser,
      bgcolor: 'bg-primary/10 dark:bg-primary/10',
      textclr: 'text-primary',
      url: '/customers',
      badge: '+12 this month',
      badgeStyle: 'text-success bg-success/10',
    },
    {
      key: 'target',
      title: 'Monthly Target',
      desc: '1.25M',
      subtitle: 'EGP · September 2026',
      img: iconBriefcase,
      bgcolor: 'bg-warning/10 dark:bg-warning/10',
      textclr: 'text-warning',
      url: '/targets',
      badge: 'Target',
      badgeStyle: 'text-warning bg-warning/10',
    },

    {
      key: 'collections',
      title: 'Collections',
      desc: '920K',
      subtitle: 'EGP collected this month',
      img: iconMailbox,
      bgcolor: 'bg-success/10 dark:bg-success/10',
      textclr: 'text-success',
      url: '/collections',
      badge: '+8.5% vs last month',
      badgeStyle: 'text-success bg-success/10',
    },

    {
      key: 'installations',
      title: 'Pending Installations',
      desc: '12',
      subtitle: 'Branches waiting for installation',
      img: iconConnect,
      bgcolor: 'bg-cyan-500/10 dark:bg-cyan-500/10',
      textclr: 'text-cyan-500',
      url: '/installations',
      badge: '5 unassigned',
      badgeStyle: 'text-error bg-error/10',
    },
  ];

  return (
    <div className="w-full">
      <Swiper
        slidesPerView={6}
        spaceBetween={20}
        loop={true}
        freeMode={true}
        grabCursor={true}
        speed={5000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        modules={[Autoplay]}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 12,
          },
          480: {
            slidesPerView: 1.4,
            spaceBetween: 12,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 14,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 16,
          },
          1030: {
            slidesPerView: 4,
            spaceBetween: 18,
          },
          1200: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          1400: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
        }}
        className="mySwiper !pb-1"
      >
        {TopCardInfo.map((item) => (
          <SwiperSlide key={item.key}>
            <Link to={item.url} className="block h-full group">
              <CardBox
                className={`
                  w-full
                  h-full
                  min-h-[170px]
                  border
                  border-transparent
                  ${item.bgcolor}
                  shadow-none
                  transition-all
                  duration-300
                  ease-in-out
                  group-hover:-translate-y-1
                  group-hover:shadow-md
                `}
              >
                <div className="flex flex-col h-full justify-between">
                  {/* ============================
                      TOP SECTION
                  ============================ */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`
                        flex
                        items-center
                        justify-center
                        w-12
                        h-12
                        rounded-xl
                        bg-white/70
                        dark:bg-white/5
                        shrink-0
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      `}
                    >
                      <img
                        src={item.img}
                        width="28"
                        height="28"
                        alt={item.title}
                        className="object-contain"
                      />
                    </div>

                    <span
                      className={`
                        text-[11px]
                        font-semibold
                        px-2
                        py-1
                        rounded-full
                        whitespace-nowrap
                        ${item.badgeStyle}
                      `}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* ============================
                      KPI CONTENT
                  ============================ */}
                  <div className="mt-5">
                    <p
                      className={`
                        text-sm
                        font-medium
                        ${item.textclr}
                        opacity-90
                        mb-1
                      `}
                    >
                      {item.title}
                    </p>

                    <h5
                      className={`
                        text-2xl
                        font-bold
                        tracking-tight
                        ${item.textclr}
                        mb-1
                        
                      `}
                    >
                      {item.desc}
                    </h5>

                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </CardBox>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export { TopCards };
