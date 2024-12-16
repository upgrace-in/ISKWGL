export default function GalleryIMGs(props) {

    const mainFolder = "/gallery/"

    return (
        props?.data.map((d, i) => {
            return <div class="video-holder vh2 item" key={i}>
                <a data-fancybox="video" target="_blank" href={`${mainFolder}${d.src}`}>
                    <figure class="mb-0">
                        <img src={`${mainFolder}${d.src}`} alt="Not Found" />
                    </figure>
                </a>
            </div>
        })

    )
}