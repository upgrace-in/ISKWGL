'use client'

import CompetitionRegisterForm from "@/Components/CompetitionRegisterForm"

const competitionImages = [
    '/images/drawing-competition-janmashtami.jpeg',
    '/images/fancy-dress-competition-janmashtami.jpeg',
    '/images/sloka-learning-janmashtami.jpeg'
];

export default function Page({ params }) {
    return (
        <CompetitionRegisterForm
            {...params}
            heading={"JANMASHTAMI COMPETITIONS"}
            description={"Register for Janmashtami competitions below. Please select your event and fill in your details to complete your registration. Each event has a nominal registration fee of Rs. 50/-."}
            payingOptions={[
                { title: "Drawing Competition", amount: 50, imagePath: competitionImages },
                { title: "Sloka Learning & Competition", amount: 50, imagePath: competitionImages },
                { title: "Fancy Dress Competition", amount: 50, imagePath: competitionImages }
            ]}
            fields={[
                'eventName',
                'amount',
                'name',
                'gender',
                'phone',
                'email',
                'dob',
                'pin',
                'address'
            ]}
        />
    )
}
