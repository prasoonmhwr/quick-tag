import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-transparent text-white pb-8 mt-0 relative bottom-0 w-full max-h-[200px] overflow-hidden">
        <div className="max-w-6xl mx-auto flex justify-center px-4">
          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[200px] xl:text-[300px] font-bold bg-gradient-to-b from-gray-300/30 to-gray-200/30 bg-clip-text text-transparent leading-none text-center">
            QUICKTAG
          </h2>
           <div className="flex absolute top-[-5px] z-2 text-md font-light  text-gray-500 w-fit">Made with <img className='mx-1' src='/heart.svg' height={20} width={20}></img> by <Link className='ml-1 text-purple-900' href={'https://x.com/prasoonmahawar'}> @prasoonmahawar</Link></div>
        </div>
      </footer>
  )
}