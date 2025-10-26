import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Header() {
  return (
    <header className="bg-gray-100 px-4 py-2 flex gap-x-4 text-black justify-between items-center border-b border-gray-400">
      <nav className="flex flex-row items-center">
        {/* Responsive logo */}
        <img
          src="/logo.svg"
          alt="Nexus Logo"
          className="h-10 w-auto sm:h-12 md:h-16"
        />
      </nav>

      <div className="flex items-center gap-x-4">
        <ConnectButton />
      </div>
    </header>
  )
}
