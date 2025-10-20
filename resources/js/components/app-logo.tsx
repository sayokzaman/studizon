export default function AppLogo() {
    return (
        <>
            {/* <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div> */}
            <img src="/logo.png" alt="" className="size-10" />
            <span className="leading-none mb-0.5 truncate text-2xl font-semibold tracking-widest -ml-2">
                TUDIZON
            </span>
        </>
    );
}
