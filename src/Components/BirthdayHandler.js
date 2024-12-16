"use client"
import Marquee from "react-fast-marquee";
import axios from "axios";
import { useEffect, useState } from "react";

function Handler() {

    const [birthdayMessage, setBirthdayMessage] = useState()

    const getBirthdayMessage = async () => {
        try {
            const response = await axios.get('/api/getBirthdayDetails')
            if (response.status === 200) {
                const today = new Date();
                const todayString = today.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', month: '2-digit', day: '2-digit' });
        
                const names = response.data.data
                    .filter(person => {
                        const dob = new Date(person.dob);
                        const dobString = dob.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', month: '2-digit', day: '2-digit' });
                        return dobString === todayString;
                    })
                    .map(person => person.name);
                
                if(names.length === 0) return
                const namesString = names.join(', ');
                const message = `We wish ${namesString} a very Happy KRISHNA conscious birthday`;
                setBirthdayMessage(message)
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getBirthdayMessage()
    }, [])

    return birthdayMessage
        ?
        <Marquee
            autoFill={false}
            pauseOnHover={true}
            gradient={true}
            gradientWidth={500}
            gradientColor={"#000"}
            pauseOnClick={true}
            speed={150}>
            <h5>{birthdayMessage}</h5>
        </Marquee>
        : ""

}

export default Handler;
