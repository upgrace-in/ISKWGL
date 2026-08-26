'use client'
import { useEffect, useState } from "react"
import Checkout from '@/Helpers/Checkout'
import axios from 'axios'
import { useRouter } from "next/navigation"
import HandlePayment from "@/Helpers/HandlePayment"
import { useDonate } from "@/Helpers/PaymentPageHandler";

export default function Page({ }) {
    const { handleDonateClick } = useDonate();

    const router = useRouter()

    const [data, setData] = useState()

    const payForData = [
        { title: "15 Devotees Prasadam Seva", amount: 1516 },
        { title: "30 Devotees Prasadam Seva", amount: 3116 },
        { title: "60 Devotees Prasadam Seva", amount: 6116 },
        { title: "100 Devotees Prasadam Seva", amount: 10116 },
        { title: "Flower Decoration Seva", amount: 2116 }, 
        { title: "Abhishekam Seva", amount: 3016 }, 
        { title: "New Dress Decoration Seva", amount: 30000 }, 
        { title: "Custom" , amount: 0},
    ]

    const [amount, setAmount] = useState(payForData[0]?.amount)
    const [donateFor, setDonateFor] = useState()

    const [status, setStatus] = useState({})
    const [memoryStatus, setMemoryStatus] = useState(false)

    useEffect(() => {
        if (donateFor) {
            setAmount(JSON.parse(donateFor)?.amount)
        }
    }, [donateFor])

    const checkPropertyAndData = async (dict, propertyName) => {
        if (!dict.hasOwnProperty(propertyName) || dict[propertyName] === "")
            throw { error: `Kindly fill ${propertyName}...` }
        if (propertyName === 'dob') {
            const selectedDate = new Date(dict[propertyName])
            const currentDate = new Date()
            console.log(selectedDate, currentDate)
            if (selectedDate > currentDate)
                throw { error: "Invalid DOB!" }
        }
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
        finalData['donationType'] = JSON.parse(finalData['donationType'])?.title || "Custom"

        try {

            // VALIDATIONS
            let validateThem = ['name', 'email', 'phone', 'address', 'pin', 'amount', 'dob']
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
            const response = await axios.post(`/api/createDonation/`, finalData)
            clearInterval(intern)
            if (response?.status !== 200) throw { error: "Unable to save data, please try again later !!!" }

            // pass the orderID with data to HandlePayment
            setData(response.data)

        } catch (e) {
            console.log(e)
            setStatus({ ...e, default: false })
        }
    }

    // 1. Safely parse the current selection title
    const selectedTitle = donateFor ? JSON.parse(donateFor)?.title : payForData[0]?.title;
    const isCustom = selectedTitle === "Custom";

    return (
        <section className="donation-form-sec">
            <HandlePayment data={data} />
            <div className="container">
                <div className="row d-flex justify-content-center mb-5">
                    <div className="col-md-10">
                        <div id="scrollToDonationForm" className="heading">
                            <h2 className="head-1">Balaram Purnima Seva Opportunities</h2>

                            {/* <p className="b-line">If you would like to make a donation towards a particular area of
                                activity, please select an option from below. ISKCON relies entirely on voluntary
                                donations and so every donation counts. Please note that donation is processed on a
                                secure site.</p> */}
                        </div>
                    </div>
                </div>
                <div className="form-wrap my-5 fw-form">
                    <form id="donateForm" onSubmit={(e) => {
                            e.preventDefault();
                            // Parse the JSON string from the select value safely
                            const selectedOption = e.target.donationType.value 
                                ? JSON.parse(e.target.donationType.value) 
                                : {};

                            const title = selectedOption?.title || "Custom";
                            handleDonateClick(e.target.amount.value, "Balaram Purnima-"+title, "Balaram Purnima");
                        }}>
                        <div className="row align-items-start">
                            <div className="col-lg-4 pe-xl-4">
                                <div className="donate-img">
                                    <figure className="up-right">
                                        <img src={`/headerImages/balaram-purnima-2026.jpeg`} alt="" /></figure>
                                </div>
                                {/* <div className="form-part mt-4 me-lg-2">
                                    <div className="notes-wrap mt-0">
                                        <p className="text-center"><span> Please Note:</span> Complete Address with PIN-Code
                                            and PAN is mandatory for an 80G Receipt.</p>
                                    </div>
                                </div> */}
                            </div>
                            <div className="col-lg-8 mt-lg-0 mt-4 ">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-part"><label for="">Seva</label><select
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
                                    <div className="col-md-6">
                                        <div className="form-part"><label for="">Amount*</label><input type="text"
                                            name="amount" onChange={(e) => setAmount(e.target.value)} value={amount} defaultValue={amount} readOnly={!isCustom} className={!isCustom ? "bg-gray-100 cursor-not-allowed" : ""} placeholder="Enter Amount" /></div>
                                    </div>
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
                                    <div className="col-12 mt-2">
                                        <button type="submit" disabled={status?.disabled}
                                            className="box-hover custom-btn-cls donation_btn ms-0 donate-now-clicked-form">DONATE
                                            NOW </button></div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="donate-note my-5">
                    <p>Note: Avail 80G Benefits On All Donations Made To ISKCON Warangal.
                    </p>
                    <p>&quot;Exemption order ref no. AAATI0017PF2021901 dated 17/08/2026 valid up-to 31/03/2031.&quot;</p>
                </div>
            </div>
        </section>
    )
}