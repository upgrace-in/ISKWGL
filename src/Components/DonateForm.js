'use client'
import { useEffect, useState } from "react"
import Checkout from '@/Helpers/Checkout'
import axios from 'axios'
import { useRouter } from "next/navigation"
import HandlePayment from "@/Helpers/HandlePayment"
import Image from "next/image"

export default function DonateForm(props) {

    const router = useRouter()

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
        <section class="donation-form-sec">
            <HandlePayment data={data} />
            <div class="container">
                <div class="row d-flex justify-content-center mb-5">
                    <div class="col-md-10">
                        <div id="scrollToDonationForm" class="heading">
                            <h2 class="head-1">QUICK DONATE</h2>
                            <p class="b-line">If you would like to make a donation towards a particular area of
                                activity, please select an option from below. ISKCON relies entirely on voluntary
                                donations and so every donation counts. Please note that donation is processed on a
                                secure site.</p>
                        </div>
                    </div>
                </div>
                <div class="form-wrap my-5 fw-form">
                    <form id="donateForm" onSubmit={(e) => handleSubmit(e)}>
                        <div class="row align-items-start">
                            <div class="col-lg-4 pe-xl-4">
                                <div class="donate-img">
                                    <figure class="up-right">
                                        <Image width={100} height={100} src={`/donateForIMGs/${donateFor === "Akshay Tritiya" ? "akshaytritiya.jpg" : "krishna.webp"}`} alt=""></Image></figure>
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
                                        <div class="form-part"><label for="">Donation For</label><select
                                            name="donationType" onChange={(e) => setDonateFor(e.target.value)}>
                                            {
                                                payForData.map((d, i) => {
                                                    return donateFor.replace('_', ' ') === d.title
                                                        ? <option selected value={d.title} key={i}>{d.title}</option>
                                                        : <option value={d.title} key={i}>{d.title}</option>
                                                })
                                            }
                                        </select><a class="donation-link"
                                            href="/#donate">view more
                                                donation options</a></div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">Amount*</label><input type="text"
                                            name="amount" defaultValue={amount} placeholder="Enter Amount" /></div>
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
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">Address*</label><textarea
                                            type="text" name="address" placeholder="Address"
                                            aria-label="For Prasadam please provide this" class=""></textarea></div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-part"><label for="">PIN Code*</label><input
                                            type="text" minlength="6" maxlength="6" name="pin"
                                            placeholder="PIN Code" /></div>
                                    </div>
                                    <div class="col-12">
                                        <div class="type_checkbox mt-3">
                                            <input type="checkbox" onChange={() => setMemoryStatus(old => !old ? true : false)} id="memoryOfSomeone" />
                                            <label for="memoryOfSomeone">This Donation in the
                                                memory/honor of someone or performed on a specific occasion</label>
                                        </div>

                                        {
                                            memoryStatus
                                                ?
                                                <div class="col-md-6 mt-2">
                                                    <div class="form-part"><label for="">Name*</label><input maxlength="50"
                                                        type="text" name="memoryOfSomeoneName" placeholder="Name" /></div>
                                                </div>
                                                : ""
                                        }
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