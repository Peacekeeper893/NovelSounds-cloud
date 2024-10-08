import React, { useEffect, useState } from "react";
import ChapterPlayer from "./BookComponents/ChapterPlayer";
import Hero from "./BookComponents/Hero";
import Navigation from "./BookComponents/Navigation";
import { useParams } from "react-router-dom";
import Modal from "./Utils/Modal";
import Navbar from "./Navbar";
import { auth } from "../firebase";
import LoadingScreen from "./Utils/LoadingScreen";
import { getAuth } from "firebase/auth";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import chapters from "./../data/hp4";

const API_BASE = "https://audioapi-euhq.vercel.app";

const Book = ({ loggedIn }) => {
    const { book_name } = useParams();

    const [chapter_number, setChapter_number] = useState("0");
    const [book, setbook] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Initialize loading state to true
    const [openModal, setOpenModal] = useState(false);
    const [user, setUser] = useState({});
    const [showPlayer, setShowPlayer] = useState(true);
    const [open, setOpen] = useState("book");
    const [host, setHost] = useState("do");
    const [audioUrl, setAudioUrl] = useState(null);

    const openModalHandler = () => {
        setOpenModal((prev) => !prev);

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            // Chrome, Safari and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
    };

    const closeModalHandler = () => {
        if (document.exitFullscreen) {
            console.log("exitFullscreen");
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            // Chrome, Safari and Opera
            console.log("exitFullscreen");

            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            // IE/Edge
            document.msExitFullscreen();
        }

        setOpenModal(false);
    };

    const GetBook = () => {
        fetch(API_BASE + "/book/" + book_name)
            .then((res) => res.json())
            .then((data) => {
                setbook(data);

                if (data[0]["aws_hosted"] === true) {
                    setHost("aws");
                }
                setIsLoading(false);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        setTimeout(() => {
            const user = auth.currentUser;
            setUser(user);
        }, 1000);

        GetBook();
    }, []);

    // Add book to recent

    useEffect(() => {
        const handleRecord = async () => {
            try {
                if (book && user && user.uid) {
                    const q = query(
                        collection(db, "users", user.uid, "recent"),
                        where("name", "==", book[0]?.name)
                    );

                    let querySnapshot;
                    try {
                        querySnapshot = await getDocs(q);
                    } catch (e) {
                        console.log(e);
                    }
                    if (!querySnapshot.empty) {
                        const docRef = doc(
                            db,
                            "users",
                            user.uid,
                            "recent",
                            querySnapshot.docs[0].id
                        );
                        await updateDoc(docRef, {
                            timestamp: serverTimestamp(),
                        });
                        console.log("Document successfully updated!");
                        // setThird(false);
                    } else {
                        addDoc(collection(db, "users", user.uid, "recent"), {
                            name: book[0]["name"],
                            timestamp: serverTimestamp(),
                        })
                            .then(() => {
                                console.log(
                                    "Document successfully written to recent!"
                                );
                            })
                            .catch((error) => {
                                console.error(
                                    "Error writing document: ",
                                    error
                                );
                            });
                    }
                }
            } catch (e) {
                console.log(e);
            }
        };

        const handlestat = async () => {
            try {
                if (book && user && user.uid) {
                    const q = query(
                        collection(db, "all-stats"),
                        where("name", "==", book[0]["name"])
                    );

                    let querySnapshot;
                    try {
                        querySnapshot = await getDocs(q);
                    } catch (e) {
                        console.log(e);
                    }

                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((docx) => {
                            const docRef = doc(db, "all-stats", docx.id);
                            updateDoc(docRef, {
                                listens: docx.data()["listens"] + 1,
                            });
                        });
                    } else {
                        addDoc(collection(db, "all-stats"), {
                            name: book[0]["name"],
                            listens: 1,
                        })
                            .then(() => {
                                console.log(
                                    "Document successfully written to all-stats!"
                                );
                            })
                            .catch((error) => {
                                console.error(
                                    "Error writing document: ",
                                    error
                                );
                            });
                    }
                }
            } catch (e) {
                console.log(e);
            }
        };

        if (user && book) {
            setTimeout(() => {
                handleRecord();
            }, 8000);

            setTimeout(() => {
                handlestat();
            }, 8000);
        }
    }, [user, book]);

    // save the progress of the user

    const handleProgress = async (progress) => {
        if (book && user && user.uid) {
            const q = query(
                collection(db, "users", user.uid, "progress"),
                where("name", "==", book[0]["name"])
            );

            let querySnapshot;
            try {
                querySnapshot = await getDocs(q);
            } catch (e) {
                console.log(e);
            }
            if (!querySnapshot.empty) {
                const docRef = doc(
                    db,
                    "users",
                    user.uid,
                    "progress",
                    querySnapshot.docs[0].id
                );
                await updateDoc(docRef, {
                    chapter: progress,
                });
                console.log("Progress Document successfully updated!");
                // setThird(false);
            } else {
                addDoc(collection(db, "users", user.uid, "progress"), {
                    name: book[0]["name"],
                    chapter: progress,
                    total: book[0]["chapters"].length,
                })
                    .then(() => {
                        console.log(
                            "Document successfully written to progress!"
                        );
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                    });
            }
        }
    };

    const handleListenHistory = async (data) => {
        addDoc(collection(db, "users", user.uid, "history"), {
            name: book[0]["name"],
            chapter: data,
            at: serverTimestamp(),
        })
            .then(() => {
                console.log("History Document successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    };

    const sendData = (data) => {
        setShowPlayer(true);
        setChapter_number((prev) => data);
        var currentURL = window.location.href;
        // Store data in local storage with the URL as the key
        localStorage.setItem(currentURL, data);

        const test = true;

        setTimeout(() => {
            if (test) {
                handleListenHistory(data);
            }
        }, 5000);

        setTimeout(() => {
            if (user && book) {
                handleProgress(data);
            }
        }, 1000);
    };

    const getDigitalOceanUrl = async (book_name, chapter_number) => {

        const response = await fetch("https://admin-server-rose.vercel.app/getDO_url/" + book_name + "/" + chapter_number);
        const data = await response.json();

        console.log(data.url);

        return data.url;
        
    };



    async function getAWSurl(book, chapter_number) {
        // Assuming you're making an API call to get the URL
        const response = await fetch("https://admin-server-rose.vercel.app/mp3url/" + book[0]["chapters"][parseInt(chapter_number) - 1]["url"]);
        const data = await response.json();

        
    
        // Assuming the URL is in the 'url' property of the returned data
        return data.url;
    }

    useEffect(() => {
        const fetchAudioUrl = async () => {
            let url;
            if (host === "do") {
                url = await getDigitalOceanUrl(book_name, chapter_number);
            } else {
                url = await getAWSurl(book, chapter_number);
            }
            setAudioUrl(url);
        };
    
        if (book && host && chapter_number !== "0")
        { 
            fetchAudioUrl();
        }
    }, [book, chapter_number, host]);

    return (
        <div>
            {isLoading ? (
                <LoadingScreen />
            ) : openModal ? (
                <Modal
                    closeModalHandler={closeModalHandler}
                    openModalHandler={openModalHandler}
                    book={book}
                    chapter_number={chapter_number}
                    sendData={sendData}
                />
            ) : (
                <div className="min-h-screen dark:bg-d-bg-200 dark:text-white">
                    <Navbar loggedIn={loggedIn} home={false} />
                    <hr className="dark:border-d-primary-300 border-d-bg-300" />

                    <Hero
                        book={book}
                        user={user}
                        sendData={sendData}
                        chapter_number={chapter_number}
                        open={open}
                        setOpen={setOpen}
                    />

                    {!loggedIn ? (
                        <div className="text-center py-16 h-full dark:bg-d-bg-200 dark:text-white">
                            Please Log-In to listen to this audiobook
                        </div>
                    ) : (
                        <Navigation
                            sendData={sendData}
                            book={book}
                            chapter_number={chapter_number}
                            open={open}
                                        setOpen={setOpen}
                                       
                        />
                    )}
                </div>
            )}

            {chapter_number !== "0" && showPlayer && (
                <div
                    className={`${!openModal && "sticky bottom-0"} ${
                        openModal &&
                        "absolute bottom-0 w-full text-white font-bold text-2xl"
                    }`}
                >
                    <ChapterPlayer
                        title={
                            chapter_number +
                            ". " +
                            book[0]["chapters"][parseInt(chapter_number) - 1][
                                "chapter_title"
                            ]
                        }
                        // url={`https://audio.jukehost.co.uk/${
                        //     book[0]["chapters"][parseInt(chapter_number) - 1][
                        //         "url"
                        //     ]
                        // }`}
                        url={
                            audioUrl
                        }
                        // url="https://novsound-ubukj-234.s3.amazonaws.com/WTCS/4.mp3"
                        openModalHandler={openModalHandler}
                        closeModalHandler={closeModalHandler}
                        openModal={openModal}
                        book={book}
                        chapter_number={chapter_number}
                        sendData={sendData}
                        setShowPlayer={setShowPlayer}
                    />
                </div>
            )}
        </div>
    );
};

export default Book;
