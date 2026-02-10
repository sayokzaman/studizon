export default function AppLogo() {
    return (
        <>
            {/* <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div> */}
            <img
                src="/logo.png"
                alt="Studizon Logo"
                className="h-10 object-contain w-full"
            />
        </>
    );
}
