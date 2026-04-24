export default function PackageIcon({width = 24, height = 24, className = '',}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width || height}
            height={height || width}
            viewBox="0 0 2048 2048"
            className={`text-gray-500 dark:text-gray-400 ${className}`}
        >
            <path fill="inherit" d="m960 120l832 416v1040l-832 415l-832-415V536zm625 456L960 264L719 384l621 314zM960 888l238-118l-622-314l-241 120zM256 680v816l640 320v-816zm768 1136l640-320V680l-640 320z"/>
        </svg>
    )
}