import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return  (
  <div className='flex justify-center items-center py-12 h-screen'>
    <SignIn 
    appearance={{
      elements: {
        card: "bg-zinc-800 border border-zinc-700 shadow-lg", 
        headerTitle: "text-zinc-200", 
        headerSubtitle: "text-zinc-400",
        dividerLine: "bg-zinc-400",
        formFieldLabel: "text-zinc-200", 
        formFieldInput: "bg-zinc-700 text-zinc-200 border-zinc-600", 
        formButtonPrimary: "bg-zinc-500 hover:bg-zinc-600", 
        socialButtonsBlockButton: "bg-zinc-700 hover:bg-zinc-600 text-zinc-200",
        footerActionText: "text-zinc-400",
        footerActionLink: "text-blue-400 hover:text-blue-300",
        footer :"bg-gradient-to-b from-zinc-700 to-zinc-900",
        formFieldInputShowPasswordIcon: "text-zinc-300"
      },
    }}
    />
    </div>)
}