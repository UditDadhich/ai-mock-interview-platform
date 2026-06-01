import React from "react"
import maleVideo from "../assets/male-ai.mp4"
import femaleVideo from "../assets/female-ai.mp4"

function Step2Interview({interviewData , onFinish}){

    const {interviewId , questions , userName} = interviewData;


    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white
        to-teal-100 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-350 min-h-[80vh] bg-white
            rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row
            overflow-hidden">

                {/* {video section} */}

                <div className="w-full lg:w-[35%] bg-white flex flex-col
                items-center p-6 space-6 border-r border-gray-200">

                    <video src=""/>

                </div>

            </div>
        </div>
    )
}

export default Step2Interview;