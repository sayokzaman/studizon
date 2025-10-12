// resources/js/lib/shorts/background.ts
export type Bg = string | null | undefined;

export function resolveBackground(bg: Bg) {
    if (!bg) return base('#0b0b0b', '#000');
    try {
        if (bg.startsWith('solid:')) {
            return { container: { backgroundColor: bg.split(':')[1] } };
        }
        if (bg.startsWith('grad:linear:')) {
            const [, , stops] = bg.split(':');
            const [a, b] = stops.split(',');
            return base(a, b);
        }
        if (bg.startsWith('grad:radial:')) {
            const [, , stops] = bg.split(':');
            const [a, b] = stops.split(',');
            return {
                container: {
                    background: `radial-gradient(circle at 30% 20%, ${a}, ${b})`,
                },
            };
        }
        if (bg.startsWith('img:')) {
            const url = bg.slice(4);
            return {
                container: {
                    backgroundImage: `url(${url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#000',
                },
            };
        }
        if (bg.startsWith('vid:')) {
            // handled at component layer with <video/>
            return {
                container: { backgroundColor: '#000', position: 'relative' },
            };
        }
    } catch {
        return base('#111827', '#000');
    }
    return base('#111827', '#000');
}

function base(a: string, b: string) {
    return { container: { background: `linear-gradient(160deg, ${a}, ${b})` } };
}
