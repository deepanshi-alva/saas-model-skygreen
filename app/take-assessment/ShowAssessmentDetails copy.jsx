import ProfileInfo from "@/components/partials/header/profile-info";
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import axiosInstance from '@/config/axios.config';
import { useAppSelector } from "@/provider/Store";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFilePath } from "../../config/file.path";

const ShowAssessmentDetails = ({ setShowQuiz, startTimer, assignmentDetails, questions, setDocumentId, current_attempts, exitFullscreen }) => {
    const router = useRouter();
    const user = useAppSelector(state => state.user);
    const params = useParams();

    // Extract data from assignmentDetails
    // const { id, title, description, max_score, min_score, valid_attempts, time_limits } = assignmentDetails;
    const { id = '', title = '', description = '', max_score = 0, min_score = 0, valid_attempts = 0, time_limits = 0 } = assignmentDetails || {};
    console.log("current_attempts", current_attempts);

    // Calculate counts
    const totalQuestions = questions?.length;
    const mcqQuestions = questions?.filter(q => q.question_type === "MCQ").length;
    const subjectiveQuestions = questions?.filter(q => q.question_type === "Subjective").length;
    const [instructions, setInstructions] = useState(false)
    const [clickCheckBox, setClickBox] = useState(false)
    const [certificateInitLength, setCertificateInitLength] = useState(0)

    //http://localhost:1337/api/attempt-contents?filters[user][id][$eq]=3&filters[assignment][documentId][$eq]=tl1r5zgw1kn0ws685gj8zzs7




    const startQuiz = async () => {
        console.log("curent", current_attempts + 1, "valid attempt", valid_attempts)
        if (current_attempts + 1 <= valid_attempts && instructions) {
            try {
                const { data } = await axiosInstance({
                    url: '/api/attempt-contents',
                    method: 'post',
                    data: {
                        data: {
                            "attempt_content_status": "In Progress",
                            "start_time": new Date(),
                            "assignment": {
                                "id": id
                            },
                            "user": {
                                "id": user.id
                            }
                        }
                    }

                })
                console.log(data.data);
                setDocumentId(data.data.documentId);
                localStorage.setItem("documentId", data.data.documentId);
                setShowQuiz(false); // Hide assessment details
                startTimer(); // Start the timer

            } catch (error) {
                console.log(error)
            }
        } else {
            console.log("Your Attempts is over..!!")
            setClickBox(true)
        }
    }

    const getCertificateDownload = async (docId) => {
        try {
            const { data } = await axiosInstance({
                url: `/api/attempt-contents?filters[documentId][$eq]=${docId}&populate=certificate`,
                method: "GET",
            });

            if (data.data[0]?.certificate?.url) {
                // Construct the full URL for the certificate
                const certificateUrl = getFilePath(data.data[0].certificate.url);

                // Fetch the file and trigger download directly
                const response = await fetch(certificateUrl);
                const blob = await response.blob();
                const link = document.createElement('a');
                const url = window.URL.createObjectURL(blob);
                link.href = url;
                link.download = 'certificate.pdf'; // Customize filename if needed
                link.click();
                window.URL.revokeObjectURL(url); // Clean up the object URL
            } else {
                console.log("Certificate not available.");
            }
        } catch (error) {
            console.log("Error downloading certificate:", error);
        }
    };


    const getTheUserResultData = async () => {
        try {
            const { data } = await axiosInstance({
                url: `/api/attempt-contents?filters[user][id][$eq]=${user.id}&filters[assignment][documentId][$eq]=${params.id}&sort=publishedAt:desc&pagination[limit]=1`,
                method: "GET",
            });
            console.log("getTheUserResultData", data.data);
            const docId = data.data[0].documentId
            getCertificateDownload(docId)
            //   /api/attempt-contents?filters[documentId][$eq]=sn5rbvyw5ac46sh83r7ljboc&populate=certificate

        } catch (error) {
            console.log(error);
        }
    }

    const getUserResultData = async () => {
        try {
            const { data } = await axiosInstance({
                url: `/api/attempt-contents?filters[user][id][$eq]=${user.id}&filters[assignment][documentId][$eq]=${params.id}&sort=publishedAt:desc&pagination[limit]=1`,
                method: "GET",
            });
            const result = data.data;
            console.log("getUserResultData", result.length);
            setCertificateInitLength(result.length)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getUserResultData()
    }, [])

    const backScreen = async () => {
        router.push("/admin/assignment");
        exitFullscreen()
    }

    return (




        <div class="">

            <section className="flex justify-between items-center px-4 py-2">

                <svg xmlns="http://www.w3.org/2000/svg" width="112" height="109.76" class="text-primary h-28 w-28"><defs><clipPath id="logo_svg__b"><path d="M0 0h112v109.834H0z" data-name="Rectangle 1"></path></clipPath><clipPath id="logo_svg__a"><path d="M0 0h112v109.76H0z"></path></clipPath></defs><g clip-path="url(#logo_svg__a)" data-name="Custom Size \u2013 1"><g clip-path="url(#logo_svg__b)" data-name="Artboard 1"><g data-name="Group 1"><path fill="#3f3f3f" d="M46.908 70.101h-.724v-3.763h.7l1.553 2.4v-2.4h.721v3.763h-.68l-1.566-2.476Zm-2.29 0h-2.03v-3.763h2.03v.661h-1.3v.859h1.3v.651h-1.3v.931h1.3Z" data-name="Path 1"></path><path fill="#3f3f3f" d="M55.86 70.101v-3.762h.737v3.763Zm-1.413-2v.126a2.2 2.2 0 0 1-.043.45 1.6 1.6 0 0 1-.135.393 2 2 0 0 1-.723.818 1.9 1.9 0 0 1-1.037.288 1.9 1.9 0 0 1-.788-.164 1.9 1.9 0 0 1-.651-.483 1.9 1.9 0 0 1-.366-.61 2 2 0 0 1-.127-.723 1.9 1.9 0 0 1 .153-.746 2 2 0 0 1 .447-.642 1.8 1.8 0 0 1 .621-.411 2.1 2.1 0 0 1 .759-.133 1.84 1.84 0 0 1 1.048.3 1.9 1.9 0 0 1 .682.869h-.893a1.05 1.05 0 0 0-.384-.305 1.2 1.2 0 0 0-.494-.1 1.1 1.1 0 0 0-.819.348 1.24 1.24 0 0 0 0 1.7 1.146 1.146 0 0 0 1.872-.338h-1.476v-.63Z" data-name="Path 2"></path><path fill="#3f3f3f" d="M68.357 70.101h-2.03v-3.763h2.03v.661h-1.3v.859h1.3v.651h-1.3v.931h1.3Zm-3.6 0h-2.03v-3.763h2.03v.661h-1.3v.859h1.3v.651h-1.3v.931h1.3Zm-5.859 0h-.724v-3.763h.7l1.553 2.4v-2.4h.721v3.763h-.682l-1.567-2.476Z" data-name="Path 3"></path><path fill="#3f3f3f" d="M73.892 70.101v-3.763h.736v3.763Zm-3.224 0h-.736v-3.763h.894a5 5 0 0 1 .636.03 1.3 1.3 0 0 1 .354.1 1.12 1.12 0 0 1 .489.419 1.17 1.17 0 0 1 .168.632 1.15 1.15 0 0 1-.24.74 1.08 1.08 0 0 1-.654.387l.941 1.46h-.878l-.971-1.747Zm0-1.932h.164a1.18 1.18 0 0 0 .678-.162.54.54 0 0 0 .231-.471.51.51 0 0 0-.193-.443 1.03 1.03 0 0 0-.6-.142h-.274Z" data-name="Path 4"></path><path fill="#3f3f3f" d="M76.931 70.101h-.724v-3.763h.7l1.553 2.4v-2.4h.721v3.763h-.682l-1.566-2.476Z" data-name="Path 5"></path><path fill="#3f3f3f" d="M84.434 68.101v.126a2.2 2.2 0 0 1-.043.45 1.6 1.6 0 0 1-.135.393 2 2 0 0 1-.723.818 1.9 1.9 0 0 1-1.037.288 1.9 1.9 0 0 1-.788-.163 1.9 1.9 0 0 1-.651-.483 1.9 1.9 0 0 1-.366-.61 2 2 0 0 1-.127-.723 1.9 1.9 0 0 1 .153-.746 2 2 0 0 1 .447-.642 1.8 1.8 0 0 1 .621-.411 2.1 2.1 0 0 1 .759-.133 1.84 1.84 0 0 1 1.048.3 1.9 1.9 0 0 1 .682.869h-.893a1.06 1.06 0 0 0-.384-.305 1.2 1.2 0 0 0-.495-.1 1.1 1.1 0 0 0-.819.348 1.24 1.24 0 0 0 0 1.7 1.146 1.146 0 0 0 1.872-.338h-1.476v-.63Z" data-name="Path 6"></path><path fill="#3f3f3f" d="M84.711 69.393h.661v.708h-.661z" data-name="Rectangle 1"></path><path fill="#f45f0e" d="M87.747 70.101h-.736v-3.763h.935a3 3 0 0 1 .562.039.9.9 0 0 1 .331.123 1.1 1.1 0 0 1 .366.417 1.2 1.2 0 0 1 .132.552 1.1 1.1 0 0 1-.356.863 1.38 1.38 0 0 1-.961.324h-.274Zm0-2.081h.2a.73.73 0 0 0 .471-.133.53.53 0 0 0 0-.763.78.78 0 0 0-.481-.125h-.189Z" data-name="Path 7"></path><path fill="#f45f0e" d="m90.888 69.316-.292.788h-.763l1.459-3.763h.636l1.439 3.763h-.788l-.3-.788Zm1.151-.7-.444-1.213-.454 1.213Z" data-name="Path 8"></path><path fill="#f45f0e" d="M97.879 68.932h.672v.054a.56.56 0 0 0 .124.381.41.41 0 0 0 .331.144.47.47 0 0 0 .351-.133.5.5 0 0 0 .129-.36q0-.365-.522-.522l-.1-.035a1.35 1.35 0 0 1-.651-.388.95.95 0 0 1-.213-.638 1.2 1.2 0 0 1 .294-.851 1 1 0 0 1 .781-.32.96.96 0 0 1 .728.285 1.22 1.22 0 0 1 .3.8h-.666v-.03a.4.4 0 0 0-.108-.293.39.39 0 0 0-.285-.111.36.36 0 0 0-.285.114.44.44 0 0 0-.1.31.4.4 0 0 0 .022.146.3.3 0 0 0 .067.115 1.04 1.04 0 0 0 .454.215c.1.027.183.05.238.069a1.17 1.17 0 0 1 .573.377 1.02 1.02 0 0 1 .184.628 1.33 1.33 0 0 1-.322.935 1.1 1.1 0 0 1-.859.353 1.04 1.04 0 0 1-.814-.342 1.3 1.3 0 0 1-.318-.9m-3.484 0h.672v.054a.57.57 0 0 0 .124.381.41.41 0 0 0 .33.144.47.47 0 0 0 .351-.133.5.5 0 0 0 .129-.36q0-.365-.522-.522l-.1-.035a1.35 1.35 0 0 1-.651-.388.95.95 0 0 1-.213-.638 1.2 1.2 0 0 1 .294-.851 1 1 0 0 1 .781-.32.96.96 0 0 1 .728.285 1.22 1.22 0 0 1 .3.8h-.666v-.03a.4.4 0 0 0-.108-.293.39.39 0 0 0-.285-.111.36.36 0 0 0-.285.114.5.5 0 0 0-.083.456.3.3 0 0 0 .068.115 1.03 1.03 0 0 0 .454.215c.1.027.183.05.238.069a1.17 1.17 0 0 1 .573.377 1 1 0 0 1 .184.628 1.33 1.33 0 0 1-.322.935 1.1 1.1 0 0 1-.859.353 1.04 1.04 0 0 1-.814-.342 1.31 1.31 0 0 1-.317-.9Z" data-name="Path 9"></path><path fill="#f45f0e" d="M103.746 68.212a2 2 0 0 1 .083-.587 1.9 1.9 0 0 1 .246-.515 1.92 1.92 0 0 1 1.619-.848 1.9 1.9 0 0 1 .723.144 2 2 0 0 1 .621.417 2 2 0 0 1 .429.633 1.9 1.9 0 0 1 .147.737 2.1 2.1 0 0 1-.138.758 1.8 1.8 0 0 1-.407.629 1.9 1.9 0 0 1-.629.44 1.9 1.9 0 0 1-.754.154 2 2 0 0 1-.775-.15 1.8 1.8 0 0 1-.627-.444 1.9 1.9 0 0 1-.4-.627 2 2 0 0 1-.137-.743m.772-.025a1.2 1.2 0 0 0 .081.452 1.2 1.2 0 0 0 .237.381 1.2 1.2 0 0 0 .393.291 1.1 1.1 0 0 0 .454.1 1.1 1.1 0 0 0 .827-.353 1.22 1.22 0 0 0 .334-.875 1.13 1.13 0 0 0-.336-.822 1.1 1.1 0 0 0-.811-.339 1.15 1.15 0 0 0-.836.338 1.11 1.11 0 0 0-.345.826Zm-2.915 1.915v-3.761h.736v3.763Z" data-name="Path 10"></path><path fill="#f45f0e" d="M109.751 70.101h-.724v-3.763h.7l1.553 2.4v-2.4h.721v3.763h-.682l-1.566-2.476Z" data-name="Path 11"></path><path fill="#ccc" d="M13.111 41.184s13.727 22.9 9.53 41.068C18.008 102.314 0 109.768 0 109.768l29.34.066c8.643-12.031 6.675-24.291 4.868-32.24-4.868-21.425-21.1-36.41-21.1-36.41" data-name="Path 12"></path><path d="m19.516 108.223-.39-.385a37 37 0 0 0 2.085-2.3l.421.349c-.663.8-1.373 1.583-2.117 2.337m4.11-4.98-.453-.309c.612-.9 1.187-1.831 1.705-2.777l.48.264a34 34 0 0 1-1.732 2.822m3.181-5.8-.5-.215c.424-.992.806-2.019 1.136-3.055l.521.166a33 33 0 0 1-1.152 3.1Zm2.009-6.3-.535-.116a38 38 0 0 0 .559-3.215l.543.071c-.141 1.1-.333 2.2-.566 3.26Zm.861-6.554-.547-.028c.035-.7.051-1.424.051-2.142 0-.371 0-.749-.013-1.123l.547-.013q.015.569.015 1.136c0 .727-.014 1.457-.05 2.169Zm-.7-6.554a58 58 0 0 0-.4-3.246l.542-.084c.171 1.1.307 2.2.409 3.278Zm-1-6.463a62 62 0 0 0-.775-3.18l.53-.144c.29 1.068.553 2.149.781 3.209Zm-1.714-6.318a65 65 0 0 0-1.095-3.088l.514-.2a62 62 0 0 1 1.1 3.114Zm-2.343-6.116c-.821-1.855-1.417-2.935-1.424-2.945l.478-.266c.007.011.612 1.111 1.445 2.989Z" data-name="Path 13"></path><path d="M14.162.395s-2.352 20.679 3.724 30.97c.011.016-4.1 7.557-5.194 12.578-1.829 8.428-3.234 22.216-3.234 22.216-10.977-36.067 4.7-65.763 4.7-65.763" data-name="Path 14"></path><path fill="#f45f0e" d="M17.2 82.752c-11.556-35.577.685-57.121 40.379-55.493 0 0-42.656 13.613-40.379 55.493" data-name="Path 15"></path><path d="M19.144 0s-1.06 4.805.178 6.9a39 39 0 0 0-2.894 3.222c-.78 1.161-2.653 4.383-2.653 4.383C13.364 8.334 19.144 0 19.144 0" data-name="Path 16"></path><path fill="#f45f0e" d="M59.4 64.005h-2.895l-1.888-5.041a4.9 4.9 0 0 0-.686-1.2 4.7 4.7 0 0 0-.99-.947 4.6 4.6 0 0 0-1.257-.619 4.8 4.8 0 0 0-1.47-.22h-4.933v8.027h-2.667v-18.8h8.911q.806 0 1.537.035a11 11 0 0 1 1.395.157 6.4 6.4 0 0 1 1.256.363 4.6 4.6 0 0 1 1.127.669 4.9 4.9 0 0 1 1.385 1.823 5.4 5.4 0 0 1 .472 2.207 5.1 5.1 0 0 1-.311 1.808 4.5 4.5 0 0 1-.9 1.467 5.2 5.2 0 0 1-1.424 1.082 6.4 6.4 0 0 1-1.889.626v.043a5.22 5.22 0 0 1 3.229 3.4Zm-14.118-10.28h5.97a11.4 11.4 0 0 0 2.125-.171 3.9 3.9 0 0 0 1.463-.555 2.27 2.27 0 0 0 .837-1.012 3.9 3.9 0 0 0 .267-1.523 2.77 2.77 0 0 0-1.066-2.4 5.5 5.5 0 0 0-3.229-.776h-6.367Z" data-name="Path 17"></path><path fill="#f45f0e" d="M68.477 50.063a7.9 7.9 0 0 1 2.834.483 5.9 5.9 0 0 1 2.154 1.4 6.2 6.2 0 0 1 1.371 2.242 9.6 9.6 0 0 1-.008 6.023 6.2 6.2 0 0 1-1.386 2.243 5.9 5.9 0 0 1-2.156 1.4 7.9 7.9 0 0 1-2.81.477 7.8 7.8 0 0 1-2.779-.475 5.92 5.92 0 0 1-3.563-3.617 9.56 9.56 0 0 1-.008-6.051 6.14 6.14 0 0 1 1.386-2.242 6 6 0 0 1 2.163-1.4 7.8 7.8 0 0 1 2.8-.483m0 12.358a4.2 4.2 0 0 0 1.676-.327 3.5 3.5 0 0 0 1.31-.982 4.7 4.7 0 0 0 .852-1.637 8.66 8.66 0 0 0 0-4.557 4.7 4.7 0 0 0-.852-1.638 3.5 3.5 0 0 0-1.31-.982 4.2 4.2 0 0 0-1.676-.327 4.2 4.2 0 0 0-1.69.327 3.5 3.5 0 0 0-1.31.982 4.7 4.7 0 0 0-.852 1.637 8.66 8.66 0 0 0 0 4.557 4.7 4.7 0 0 0 .852 1.637 3.5 3.5 0 0 0 1.31.982 4.2 4.2 0 0 0 1.69.326Z" data-name="Path 18"></path><path fill="#f45f0e" d="M87.439 62.392a5.46 5.46 0 0 1-4.157 1.937 6.2 6.2 0 0 1-2.582-.506 5.26 5.26 0 0 1-1.889-1.424 6.2 6.2 0 0 1-1.157-2.214 10 10 0 0 1-.388-2.878 9.1 9.1 0 0 1 .471-3.026 6.8 6.8 0 0 1 1.3-2.286 5.6 5.6 0 0 1 1.949-1.437 5.9 5.9 0 0 1 2.429-.5 6.6 6.6 0 0 1 2.187.349 6 6 0 0 1 1.835 1.032v-6.234h2.576v18.794h-2.576Zm0-2.32v-6.451a5.46 5.46 0 0 0-3.853-1.651 3.14 3.14 0 0 0-2.65 1.33 6.7 6.7 0 0 0-.989 4.008 6.5 6.5 0 0 0 .936 3.816 3.02 3.02 0 0 0 2.6 1.3 4.06 4.06 0 0 0 2.072-.575 6.6 6.6 0 0 0 1.888-1.775Z" data-name="Path 19"></path><path fill="#f45f0e" d="M96.41 47.825h-2.573v-2.62h2.573Zm0 16.175h-2.573V50.405h2.573Z" data-name="Path 20"></path><path fill="#f45f0e" d="M106.129 64.328a7.8 7.8 0 0 1-2.78-.477 5.93 5.93 0 0 1-3.564-3.617 9.56 9.56 0 0 1-.008-6.051 6.2 6.2 0 0 1 1.386-2.242 6 6 0 0 1 2.162-1.4 7.8 7.8 0 0 1 2.8-.483 8 8 0 0 1 2.179.285 5.5 5.5 0 0 1 1.773.847 4.7 4.7 0 0 1 1.265 1.388 5 5 0 0 1 .648 1.894h-2.665a2.5 2.5 0 0 0-.29-1.083 2.4 2.4 0 0 0-.684-.783 3.1 3.1 0 0 0-1-.477 4.5 4.5 0 0 0-1.226-.163 4.25 4.25 0 0 0-1.691.326 3.5 3.5 0 0 0-1.309.983 4.7 4.7 0 0 0-.854 1.637 8.7 8.7 0 0 0 0 4.557 4.7 4.7 0 0 0 .854 1.637 3.5 3.5 0 0 0 1.309.982 4.2 4.2 0 0 0 1.691.327 4.5 4.5 0 0 0 1.18-.156 3.2 3.2 0 0 0 1.006-.462 2.5 2.5 0 0 0 .707-.77 2.3 2.3 0 0 0 .305-1.09h2.666a4.9 4.9 0 0 1-.656 1.9 4.75 4.75 0 0 1-1.271 1.373 5.5 5.5 0 0 1-1.775.832 8.1 8.1 0 0 1-2.163.278" data-name="Path 21"></path></g></g></g></svg>

                <div className="flex justify-between items-center">
                    <span className="mx-2"><ProfileInfo /></span>
                </div>

            </section>


            <div class="relative bg-card rounded-md shadow-sm p-8 w-full mx-auto mt-20 max-w-[700px]">

                {/* <!-- Exam Title --> */}
                <h1 class="text-2xl font-bold text-center mb-2">Final Assessment</h1>
                <h2 class="text-3xl text-primary font-bold text-default-600 text-center mb-4">{title}</h2>

                {/* <p className='font-semibold text-gray-300 text-center'>{time_limits}</p> */}
                
                {/* <!-- Exam Details --> */}
                <div class="grid grid-cols-2 gap-4 mb-8">
                    {/* <!-- Questions --> */}
                    <div class="flex flex-col border rounded-md p-2 text-center min-h-[80px] items-center justify-center">
                        <p class="text-md text-gray-500">Questions</p>
                        <p class="font-bold text-lg">{mcqQuestions} MCQ</p>
                        <p class="font-bold text-lg">{subjectiveQuestions} Subjective</p>
                    </div>
                    {/* <!-- Total Questions --> */}
                    <div class="flex flex-col border rounded-md p-2 text-center min-h-[80px] items-center justify-center">
                        <p class="text-md text-gray-500">Total Questions</p>
                        <p class="font-bold text-lg">{totalQuestions}</p>
                    </div>
                    {/* <!-- Total Marks --> */}
                    <div class="flex flex-col border rounded-md p-2 text-center min-h-[80px] items-center justify-center">

                        <p class="text-md text-gray-500">Total Marks</p>
                        <p class="font-bold text-lg">{max_score}</p>
                    </div>
                    {/* <!-- Passing Marks --> */}
                    <div class="flex flex-col border rounded-md p-2 text-center min-h-[80px] items-center justify-center">

                        <p class="text-md text-gray-500">Passing Marks</p>
                        <p class="font-bold text-lg">{min_score}</p>
                    </div>
                </div>

                {/* Instruction */}

                <div className='text-left'>
                    <h3 className='font-semibold text-base pb-1'>Important Instructions Before Starting the Test:</h3>
                    <ul>
                        <li className='font-medium text-md pb-1'><b> Single-Window Test Environment:</b> Switching between browser tabs or applications is not allowed during the test.</li>
                        <li className='font-medium text-md pb-1'><b> No Right-Click Access:</b> Right-click functionality is disabled to maintain test integrity.</li>
                        <li className='font-medium text-md pb-1'><b> Time Management:</b> Ensure you complete the test within the allocated time. There will be no extensions.</li>
                        <li className='font-medium text-md pb-1'><b> Stable Internet Connection:</b>  A stable internet connection is required to avoid disruptions.</li>
                        <li className='font-medium text-md pb-1'><b> Non-Interruptive Environment:</b> Choose a quiet place where you won't be disturbed.</li>
                    </ul>
                    <p className='font-medium text-md pt-1 pb-1'>By proceeding, you agree to comply with these rules. Any violation may result in disqualification.</p>
                    <p className='font-medium text-md pb-1 pt-1 text-default-800 '><Checkbox defaultChecked id="default_1" checked={instructions} onClick={() => setInstructions(!instructions)}>
                        I have read and agree to the terms and conditions mentioned above.
                    </Checkbox></p>

                    {clickCheckBox && !instructions ?
                        <p className='text-red-500 text-center'>Read the instructions and Please check the checkbox..!!</p> : ""
                    }
                </div>

                {/* <!-- Start Section Attempt #: --> */}
                <div class="text-center">
                    {/* <p class="text-lg mb-4"><span class="font-medium text-default-800">{current_attempts === valid_attempts ? current_attempts : current_attempts + 1} / {valid_attempts} attempts left</span></p> */}
                    <p class="text-lg mt-4 mb-4"><span class="font-bold text-default-800">{current_attempts < valid_attempts ? current_attempts + 1 : current_attempts} / {valid_attempts} attempts left</span></p>

                    <Button disabled={current_attempts === valid_attempts} color="warning" onClick={() => {
                        startQuiz()

                    }}
                    >
                        Start Exam
                    </Button>
                    {certificateInitLength > 0 ? <div class="text-center mt-4">
                        <Button color="success" onClick={getTheUserResultData}>
                            Download Certificate
                        </Button>
                    </div> : ""}
                    <Button color="warning" className="mt-3" onClick={() => {
                        backScreen()
                    }}
                    >
                        Back
                    </Button>
                </div>

                {/* <!-- Note --> */}
                <p class="text-xs text-gray-500 text-center mt-8">
                    Ensure a stable <span class="text-orange-500 font-semibold">internet connection</span> before starting.
                </p>
            </div>
        </div>
    );
};

export default ShowAssessmentDetails;
