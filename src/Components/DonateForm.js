'use client'
import { useEffect, useState } from "react"
import Checkout from '@/Helpers/Checkout'
import axios from 'axios'
import { useRouter } from "next/navigation"
import HandlePayment from "@/Helpers/HandlePayment"
import Image from "next/image"
import { useDonate } from "@/Helpers/PaymentPageHandler";

export default function DonateForm(props) {

    const router = useRouter()
    const { handleDonateClick } = useDonate();

    const [data, setData] = useState()

    const [amount, setAmount] = useState(props?.amount || 0)
    const [donateFor, setDonateFor] = useState(decodeURIComponent(props?.donateFor))

    useEffect(() => {
        if (donateFor.includes('Feed')) {
            let d = donateFor.split(' ')[1]
            if (d)
                setAmount(parseInt(d) * 30)
        } else {
            setAmount(0)
        }
    }, [donateFor])

    const [status, setStatus] = useState({})
    const [memoryStatus, setMemoryStatus] = useState(false)

    const payForData = props?.payingOptions

    const checkPropertyAndData = async (dict, propertyName) => {
        if (!dict.hasOwnProperty(propertyName) || dict[propertyName] === "" || dict[propertyName] === 0)
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
            const response = await axios.post(`/api/createDonation/`, finalData)
            clearInterval(intern)
            if (response?.status !== 200) throw { error: "Unable to save data, please try again later !!!" }

            // pass the orderID with data to HandlePayment
            setData(response.data)

        } catch (e) {
            setStatus({ ...e, default: false })
        }
    }

    return (
        <section className="donation-form-sec">
            <HandlePayment data={data} />
            <div className="container">
                <div className="row d-flex justify-content-center mb-5">
                    <div className="col-md-10">
                        <div id="scrollToDonationForm" className="heading">
                            <h2 className="head-1">QUICK DONATE</h2>
                            <p className="b-line">If you would like to make a donation towards a particular area of
                                activity, please select an option from below. ISKCON relies entirely on voluntary
                                donations and so every donation counts. Please note that donation is processed on a
                                secure site.</p>
                        </div>
                    </div>
                </div>
                <div className="form-wrap my-5 fw-form">
                    <form id="donateForm" onSubmit={(e) => {
                            e.preventDefault();
                            handleDonateClick(e.target.amount.value, e.target.donationType.value, "General Donation");
                        }}>
                        <div className="row align-items-start">
                            <div className="col-lg-4 pe-xl-4">
                                <div className="donate-img">
                                    <figure className="up-right">
                                        <Image width={100} height={100} src={`/donateForIMGs/${donateFor === "Akshay Tritiya" ? "akshaytritiya.jpg" : "krishna.webp"}`} alt=""></Image></figure>
                                </div>
                                <div className="form-part mt-4 me-lg-2">
                                    <div className="notes-wrap mt-0">
                                        <p className="text-center"><span> Please Note:</span> Complete Address with PIN-Code
                                            and PAN is mandatory for an 80G Receipt.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 mt-lg-0 mt-4 ">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-part"><label for="">Donation For</label><select
                                            name="donationType" onChange={(e) => setDonateFor(e.target.value)}>
                                            {
                                                payForData.map((d, i) => {
                                                    return donateFor.replace('_', ' ') === d.title
                                                        ? <option selected value={d.title} key={i}>{d.title}</option>
                                                        : <option value={d.title} key={i}>{d.title}</option>
                                                })
                                            }
                                        </select><a className="donation-link"
                                            href="/#donate">view more
                                                donation options</a></div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-part"><label for="">Amount*</label><input type="text"
                                            name="amount" defaultValue={amount} placeholder="Enter Amount" /></div>
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
                    <p>&quot;Exemption order ref no. AAATI0017PF2021901 dated 24/09/2021 valid up-to 31/03/2026.&quot;</p>
                </div>
            </div>
        </section>
    )
}