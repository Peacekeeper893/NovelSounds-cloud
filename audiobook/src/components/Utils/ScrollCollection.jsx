import React from "react";
import { Fragment, useRef } from "react";
import { useState, useEffect } from "react";

import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";

import { Link } from "react-router-dom";
import BookDisplayScrollable from "./BookDisplayScrollable";

const ScrollCollection = ({mostPopularBooks , numbering}) => {
    const scrollRef = useRef();
    const [isScrolled, setIsScrolled] = useState(false);


    const scroll = (scrollOffset) => {
        scrollRef.current.scrollTo({
            left: scrollRef.current.scrollLeft + scrollOffset,
            behavior: "smooth",
        });
    };

    const handleScroll = () => {
        if (scrollRef.current.scrollLeft > 0) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    return (
        <div className="relative">
            {isScrolled && <div
                className="hidden md:block  absolute -left-3  top-[45%] transform -translate-y-[45%]  p-3 cursor-pointer rounded-full z-[50]"
                onClick={() => scroll(-600)}
            >
                <MdNavigateBefore
                    
                    size={36}
                    className="dark:text-d-primary-500 text-white bg-slate-900 rounded-full opacity-50 hover:opacity-95 hover:scale-110 "
                />
            </div>}
            <div
                className="absolute -right-3 top-[45%] transform -translate-y-[45%]  p-3 cursor-pointer rounded-full z-[50] block"
                onClick={() => scroll(window.innerWidth * 0.8)}
            >
                <MdNavigateNext className="dark:text-d-primary-500 text-white bg-slate-900 rounded-full opacity-50 hover:opacity-95 hover:scale-110 " size={36} />
            </div>
            <div className="absolute inset-y-0 -left-2 w-12 bg-gradient-to-r from-white to-transparent dark:from-d-bg-100 dark:to-transparent z-[30]"></div>
            <div className="absolute inset-y-0 md:right-0 -right-2 w-16 bg-gradient-to-l from-white to-transparent dark:from-d-bg-100 dark:to-transparent z-[30]"></div>
            <div
                className="relative flex overflow-x-scroll horizontal-scrollbar md:py-4 gap-1 md:gap-2"
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {mostPopularBooks.map((book, i) => (
                    <Link to={`/book/${book["name"]}`}>
                        <BookDisplayScrollable
                            name={book["name"]}
                            author={book["author"]}
                            bookimg={book["bookimg"]}
                            numbering={numbering}
                            idx={i}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ScrollCollection;
