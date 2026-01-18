export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/10 relative overflow-hidden">
      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px),transparent_1px],[linear-gradient(to_bottom,#80808012_1px),transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,#000_100%)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px),transparent_1px],[linear-gradient(to_bottom,#ffffff0a_1px),transparent_1px)] dark:bg-[size:24px_24px] dark:[mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,#000_100%)]" />

      {/* 装饰性渐变球体 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 左上角大球 */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-purple-400/10 dark:from-blue-600/10 dark:to-purple-600/5 rounded-full blur-[100px]" />
        {/* 右上角大球 */}
        <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-br from-purple-400/20 to-pink-400/10 dark:from-purple-600/10 dark:to-pink-600/5 rounded-full blur-[80px]" />
        {/* 左下角 */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-gradient-to-tr from-cyan-400/15 to-blue-400/15 dark:from-cyan-600/5 dark:to-blue-600/5 rounded-full blur-[90px]" />
        {/* 右下角 */}
        <div className="absolute bottom-[-5%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-indigo-400/20 to-purple-400/15 dark:from-indigo-600/10 dark:to-purple-600/5 rounded-full blur-[100px]" />

        {/* 小装饰球 */}
        <div className="absolute top-[20%] right-[15%] w-[200px] h-[200px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[50px]" />
        <div className="absolute bottom-[25%] left-[20%] w-[150px] h-[150px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[40px]" />
        <div className="absolute top-[40%] left-[10%] w-[180px] h-[180px] bg-pink-500/8 dark:bg-pink-500/4 rounded-full blur-[45px]" />
        <div className="absolute bottom-[15%] right-[25%] w-[220px] h-[220px] bg-cyan-500/8 dark:bg-cyan-500/4 rounded-full blur-[55px]" />
      </div>

      {/* 浮动几何图形 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-4 h-4 bg-blue-400/20 dark:bg-blue-400/10 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute top-[25%] right-[20%] w-3 h-3 bg-purple-400/20 dark:bg-purple-400/10 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[30%] left-[15%] w-5 h-5 bg-pink-400/20 dark:bg-pink-400/10 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[60%] right-[12%] w-3 h-3 bg-cyan-400/20 dark:bg-cyan-400/10 rounded-full animate-pulse" style={{ animationDuration: '3.5s' }} />
        <div className="absolute bottom-[20%] right-[30%] w-4 h-4 bg-indigo-400/20 dark:bg-indigo-400/10 rounded-full animate-pulse" style={{ animationDuration: '4.5s' }} />
        <div className="absolute top-[45%] left-[8%] w-2 h-2 bg-blue-300/30 dark:bg-blue-300/10 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }} />
        <div className="absolute top-[70%] left-[20%] w-3 h-3 bg-purple-300/30 dark:bg-purple-300/10 rounded-full animate-pulse" style={{ animationDuration: '5.5s' }} />
      </div>

      {/* 装饰性线条 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-blue-400/40 dark:text-blue-400/10" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {children}
    </div>
  )
}
