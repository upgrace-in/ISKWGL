import { useEffect, useState } from "react"
import Checkout from '@/Helpers/Checkout'
import axios from 'axios'
import HandlePayment from "@/Helpers/HandlePayment"
import Image from "next/image"
import GetSearchParams from '@/Components/GetSearchParams'

export default function Janmashtami({ params, defaultReferral }) {

    const value = GetSearchParams()
    const [redirectedFrom, setRedirectedFrom] = useState(defaultReferral)

    useEffect(() => {
        if (value) {
            setRedirectedFrom(value)
        }
    }, [value])

    const [data, setData] = useState()

    const payForData = [
        { title: "Mukhya Yajaman Seva", amount: 108000, imagePath: '/donateForIMGs/mukhya-yajaman-seva.webp', specialGifts: ["Special Puja on your name", "Opportunity to perform Panchamrita Abhishek", "Silver glass, spoon and bowl", "Radha Nilmadhav Photoframe", "Mahaprasadam Box", "Vastra Prasad"] },
        { title: "Yajaman Seva", amount: 51111, imagePath: '/donateForIMGs/yajaman-seva.jpeg', specialGifts: ["Special Puja on your name", "Opportunity to perform Panchamrita Abhishek", "Silver glass", "Radha Nilmadhav Photoframe", "Mahaprasadam Box", "Vastra Prasad"] },
        { title: "Devotee Prasadam Seva", amount: 25001, imagePath: '/donateForIMGs/devotee-prasadam-seva.jpeg', specialGifts: ["Opportunity to perform Panchamrita Abhishek", "Radha Nilmadhav Photoframe", "Mahaprasadam Box", "Vastra Prasad", "Silver bowl"] },
        { title: "Panchamrita Abhishek Seva", amount: 10116, imagePath: '/donateForIMGs/panchamrita-abhishek-seva.jpeg', specialGifts: ["Opportunity to perform Panchamrita Abhishek", "Radha Nilmadhav Photoframe", "Mahaprasadam Box", "Vastra Prasad"] },
        { title: "Vigraha Naivedya Seva", amount: 5001, imagePath: '/donateForIMGs/vigraha-naivedya-seva.jpeg', specialGifts: ["Opportunity to perform Milk Abhishek", "Vastra Prasad", "Mahaprasadam Box", "Radha Nilmadhav Photoframe"] },
        { title: "Vigraha Alankar Seva", amount: 2501, imagePath: '/donateForIMGs/vigraha-alankarana-seva.jpeg', specialGifts: ["Opportunity to perform Milk Abhishek", "Vastra Prasad", "Mahaprasadam Box"] },
        { title: "Milk Abhishek Seva", amount: 1501, imagePath: '/donateForIMGs/milk-abhishek-seva.jpeg', specialGifts: ["Opportunity to perform Milk Abhishek", "Mahaprasadam Box"] },
        { title: "Custom", amount: 1, imagePath: '/donateForIMGs/krishna-eating-butter.webp' },
    ];


    const [amount, setAmount] = useState(!params?.amount || params?.amount === '0' ? payForData[0]?.amount : params?.amount)
    const [donateFor, setDonateFor] = useState(JSON.stringify(payForData[0]))

    const [status, setStatus] = useState({})
    const [memoryStatus, setMemoryStatus] = useState(false)

    useEffect(() => {
        if (donateFor) {
            setAmount(JSON.parse(donateFor)?.amount || 0)
        }
    }, [donateFor])

    const checkPropertyAndData = async (dict, propertyName) => {
        if (!dict.hasOwnProperty(propertyName) || dict[propertyName] === "")
            throw { error: `Kindly fill ${propertyName}...` }
    }

    const increaseDots = () => {
        setStatus({ message: "Processing Payment.", disabled: true })
        setTimeout(() => {
            setStatus({ message: "Processing Payment..", disabled: true })
            setTimeout(() => {
                setStatus({ message: "Processing Payment...", disabled: true })
            }, 150)
        }, 150)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        let finalData = {}
        const formData = new FormData(e.target)
        formData.forEach((value, property) => finalData[property] = value);

        try {

            // VALIDATIONS
            let validateThem = ['name', 'email', 'phone', 'address', 'pin', 'amount']
            for (var i = 0; i < validateThem.length; i++) {
                await checkPropertyAndData(finalData, validateThem[i]).catch(e => { throw e })
            }
            if (memoryStatus == true)
                await checkPropertyAndData(finalData, 'memoryOfSomeoneName').catch(e => { throw e })
            if (!parseFloat(finalData['amount']) > 0) throw { error: "Invalid Amount !!!" }

            // ALL INPUTS are correct... Start showing progress
            let intern = setInterval(() => {
                increaseDots()
            }, 500)

            // save the data with an orderID
            const response = await axios.post(`/api/createDonation/`, { ...finalData, donationType: JSON.parse(donateFor)?.title, redirectedFrom: (redirectedFrom || '') })
            clearInterval(intern)
            if (response?.status !== 200) throw { error: "Unable to save data, please try again later !!!" }

            // pass the orderID with data to HandlePayment
            setData(response.data)

        } catch (e) {
            console.log(e)
            setStatus({ ...e, default: false })
        }
    }

    const selectedOption = JSON.parse(donateFor);
    const imagePath = selectedOption.imagePath || '/donateForIMGs/default.png';
    const specialGifts = selectedOption.specialGifts || [];

    return (
        <section class="donation-form-sec">
            <HandlePayment data={data} />
            <div class="container">
                <div class="row d-flex justify-content-center mb-5">
                    <div class="col-md-10">
                        <div id="scrollToDonationForm" class="heading">
                            <h2 class="head-1">JANMASHTAMI SEVA OPPORTUNITIES</h2>

                            {/* <p class="b-line">If you would like to make a donation towards a particular area of
                                activity, please select an option from below. ISKCON relies entirely on voluntary
                                donations and so every donation counts. Please note that donation is processed on a
                                secure site.</p> */}
                        </div>
                    </div>
                </div>
                <div class="form-wrap my-5 fw-form">
                    <form id="donateForm" onSubmit={(e) => handleSubmit(e)}>
                        <div class="row align-items-start">
                            <div class="col-lg-4 pe-xl-4">
                                <div class="donate-img">
                                    <figure class="up-right">
                                        <img src={imagePath} alt={selectedOption.title} /></figure>
                                </div>
                                <div class="form-part mt-4 me-lg-2">
                                    <div class="notes-wrap mt-0">
                                        <p class="text-center"><span> Please Note:</span> Complete Address with PIN-Code
                                            and PAN is mandatory for an 80G Receipt.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-8 mt-lg-0 mt-4 ">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">Donate For</label><select
                                            name="donationType" onChange={(e) => setDonateFor(e.target.value)}>
                                            {
                                                payForData.map((d, i) => {
                                                    return donateFor?.replace('_', ' ') === d.title
                                                        ? <option selected value={JSON.stringify(d)} key={i}>{d.title}</option>
                                                        : <option value={JSON.stringify(d)} key={i}>{d.title}</option>
                                                })
                                            }
                                        </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">Amount*</label><input type="text"
                                            name="amount" onChange={(e) => setAmount(e.target.value)} value={amount} defaultValue={amount} placeholder="Enter Amount" /></div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">Mobile Number*</label><input type="tel"
                                            placeholder="Phone Number" maxlength="10" name="phone" /></div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">Email*</label><input type="text"
                                            name="email" placeholder="Email" /></div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">Name*</label><input maxlength="50"
                                            type="text" name="name" placeholder="Name" /></div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">PAN (Optional)</label><input type="text"
                                            name="pan" id="" maxlength="10" placeholder="PAN"
                                            aria-label="For 80G reciept" class=""
                                            style={{ textTransform: "uppercase" }} /></div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-part"><label for="">Address*</label><textarea
                                            type="text" style={{ height: "100px !important" }} name="address" placeholder="Address"
                                            aria-label="For Prasadam please provide this" class=""></textarea></div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-part"><label for="">PIN Code*</label><input
                                            type="text" minlength="6" maxlength="6" name="pin"
                                            placeholder="PIN Code" /></div>
                                    </div>
                                    <div className="special-gifts form-part col-md-12">
                                        {specialGifts.length > 0 && (
                                            <>
                                                <h4>Special Gifts/Opportunities for Donors</h4>
                                                <ul>
                                                    {specialGifts.map((gift, index) => (
                                                        <li key={index}>{gift}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                    {/* <div class="col-12">
                                        <div class="type_checkbox mt-3">
                                            <input type="checkbox" onChange={() => setMemoryStatus(old => !old ? true : false)} id="memoryOfSomeone" />
                                            <label for="memoryOfSomeone">Wanna make someone's birthday brighter by donating on their behalf!</label>
                                        </div>

                                        {
                                            memoryStatus
                                                ?
                                                <div class="col-md-6 mt-2">
                                                    <div class="form-part"><label for="">Name of the Special Person*</label><input maxlength="50"
                                                        type="text" name="memoryOfSomeoneName" placeholder="Name" /></div>
                                                </div>
                                                : ""
                                        }
                                    </div> */}
                                    {
                                        status?.message ?
                                            <span className="mt-2" style={{ color: 'red' }}>
                                                {status?.message}
                                            </span>
                                            : ""
                                    }
                                    {
                                        status?.success ?
                                            <span className="mt-2" style={{ color: 'green' }}>
                                                <b>{status?.success}</b>
                                            </span>
                                            : ""
                                    }
                                    {
                                        status?.error ?
                                            <span className="mt-2" style={{ color: 'red' }}>
                                                {status?.error}
                                            </span>
                                            : ""
                                    }
                                    <div class="col-12 mt-2">
                                        <button type="submit" disabled={status?.disabled}
                                            class="box-hover custom-btn-cls donation_btn ms-0 donate-now-clicked-form">DONATE
                                            NOW </button></div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="donate-note my-5">
                    <p>Note: Avail 80G Benefits On All Donations Made To ISKCON Warangal.
                    </p>
                    <p>&quot;Exemption order ref no. AAATI0017PF2021901 dated 24/09/2021 valid up-to 31/03/2026.&quot;</p>
                </div>
            </div>
        </section>
    )
}