import React, { useState} from 'react';
import Navbar from '../components/Navbar';
import Polls from '../components/polls';

const Mypolls = () => {
    const [clicked, setclicked] = useState("your_polls");

    const setthis1 = () => {
        setclicked("liked_polls");
    };

    const setthis2 = () => {
        setclicked("your_polls");
    };

    const addclass1 = clicked === "your_polls" ? "borderbottom" : "";
    const addclass2 = clicked === "liked_polls" ? "borderbottom" : "";
    const showit1 = clicked === "your_polls" ? "" : "not_display";
    const showit2 = clicked === "liked_polls" ? "" : "not_display";

    return (
        <>
            <Navbar />
            <div className="mypolls">
                <div className="choose">
                    <div className={`my ${addclass1}`} onClick={setthis2}>
                        <p>Your Polls</p>
                    </div>
                    <div className={`my ${addclass2}`} onClick={setthis1}>
                        <p>Liked Polls</p>
                    </div>
                </div>
                <div className={`mypollsview ${showit1}`}>
                    <Polls title="name" />
                </div>
                <div className={`likedview ${showit2}`}>
                    <Polls title="hero2" />
                </div>
            </div>
        </>
    );
};

export default Mypolls;
