export function Footer() {
  return (
    <footer className="bg-black text-white border-t-4 border-black mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg uppercase">
              SEDULUR<span className="text-[#FF6B6B]">FUND</span>
            </span>
          </div>

          <div className="text-sm text-gray-400">
            Build by Axelon Labs
          </div>
        </div>
      </div>
    </footer>
  )
}
