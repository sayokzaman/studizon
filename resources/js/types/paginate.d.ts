export interface PaginationData {
    current_page: number;
    from: number | null;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    path: string;
    next_page_url: string | null;

    per_page: number;
    to: number | null;
    total: number;
}

export interface Paginated<T> {
    data: T[];
    pagination: PaginationData;
}