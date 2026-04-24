export default function Image() {
    return (
        <div className="flex items-center justify-center w-full h-full">
            <img
                src="/images/placeholders/placeholder.jpg"
                alt="Placeholder"
                className="object-cover w-full h-full"
            />
        </div>
    );
}
