// resources/js/pages/shorts/Create.tsx
import InputError from '@/components/input-error';
import BackgroundPicker from '@/components/shorts/background-picker';
import ShortCreateCard from '@/components/shorts/short-create-card';
import TypeEditors from '@/components/shorts/type-editors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useFetchList } from '@/hooks/use-fetch-list';
import AppLayout from '@/layouts/app-layout';
import { TYPES } from '@/lib/constants';
import { BreadcrumbItem } from '@/types';
import { Course } from '@/types/course';
import { Short, ShortType, Validate } from '@/types/short';
import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shorts',
        href: '/shorts',
    },
    {
        title: 'Create',
        href: '/shorts/create',
    },
];

//omit
type ShortForm = Omit<Short, 'id' | 'created_at' | 'updated_at'> & {
    course_id: number | null;
};

const initialState: ShortForm = {
    course_id: null as number | null,
    type: 'mcq' as ShortType,
    prompt: 'Preview your prompt here',
    payload: {
        choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
    },
    validate: {
        mode: 'mcq',
        correctIndex: 0,
    },
    time_limit: 15,
    max_points: 10,
    background: 'bg-linear-to-br from-indigo-500 via-purple-500 to-blue-500',
};

export default function Create() {
    const { data, setData, post, errors } = useForm(initialState);

    const [searchCourse, setSearchCourse] = useState('');
    const [opeCoursesPopover, setOpenCoursesPopover] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const widthRef = useRef<HTMLButtonElement>(null);

    const { data: courses, loading: courseLoading } = useFetchList<
        Course,
        { only_user_program: boolean }
    >({
        url: '/get-courses',
        params: { only_user_program: true },
        search: searchCourse,
    });

    const handleSubmit = () => {
        post(route('shorts.store'));
    };

    const handleTypeChange = (type: ShortType) => {
        setData({
            ...data,
            type,
            payload: handlePayloadChange(type),
            validate: handleValidationChange(type),
        });
    };

    const handlePayloadChange = (type: ShortType) => {
        switch (type) {
            case 'mcq': {
                return {
                    choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
                };
            }
            case 'true_false': {
                return undefined;
            }
            case 'one_word': {
                return {
                    placeholder: '',
                };
            }
            case 'one_number': {
                return {
                    answer: 0,
                };
            }
            case 'code_output': {
                return {
                    code: "print('hello world')",
                    language: 'python',
                };
            }
            default:
                return undefined;
        }
    };

    const handleValidationChange = (type: ShortType): Validate => {
        switch (type) {
            case 'mcq':
                return {
                    mode: 'mcq',
                    correctIndex: 0,
                };
            case 'true_false':
                return {
                    mode: 'boolean',
                    answer: true,
                };
            case 'one_word':
                return {
                    mode: 'text',
                    answers: [''],
                    caseInsensitive: false,
                    trim: true,
                    collapseSpaces: true,
                };
            case 'one_number':
                return {
                    mode: 'numeric',
                    exact: 0,
                    tolerance: 0,
                };
            case 'code_output':
                return {
                    mode: 'text',
                    answers: [''],
                    caseInsensitive: true,
                    trim: true,
                    collapseSpaces: true,
                };
            default:
                return {
                    mode: 'mcq',
                    correctIndex: 0,
                };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Short" />

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 p-4 lg:grid-cols-2">
                {/* Live preview */}
                <div className="sticky top-4">
                    <ShortCreateCard data={data} courseName={selectedCourse?.name ?? ''} />
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                        <Label>Course</Label>
                        <Popover
                            open={opeCoursesPopover}
                            onOpenChange={setOpenCoursesPopover}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    ref={widthRef}
                                >
                                    {selectedCourse ? (
                                        <>{selectedCourse.name}</>
                                    ) : (
                                        <>Select course</>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="p-0"
                                style={{
                                    width: widthRef.current?.offsetWidth,
                                }}
                                align="start"
                            >
                                <Command
                                    shouldFilter={false}
                                    className="relative"
                                >
                                    {courseLoading && (
                                        <Spinner className="absolute top-2.5 right-4" />
                                    )}
                                    <CommandInput
                                        value={searchCourse}
                                        onValueChange={setSearchCourse}
                                        placeholder="Search Department..."
                                    />
                                    <CommandList>
                                        <CommandGroup
                                            className="max-h-60 overflow-y-auto"
                                            heading="Courses"
                                        >
                                            {courses.map((course) => (
                                                <CommandItem
                                                    key={course.id}
                                                    value={course.id.toString()}
                                                    onSelect={(value) => {
                                                        setSelectedCourse(
                                                            course,
                                                        );
                                                        setData(
                                                            'course_id',
                                                            Number(value),
                                                        );
                                                        setSearchCourse('');
                                                        setOpenCoursesPopover(
                                                            false,
                                                        );
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Badge className="mr-2 w-16">
                                                        {course.code}
                                                    </Badge>
                                                    {course.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <InputError
                            message={errors.course_id}
                            className="text-xs"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                            value={data.type}
                            onValueChange={(v) =>
                                handleTypeChange(v as ShortType)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pick a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPES.map((t) => (
                                    <SelectItem
                                        key={t}
                                        value={t}
                                        className="capitalize"
                                    >
                                        <span className="capitalize">
                                            {t.replace('_', ' ')}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} className="text-xs" />
                    </div>

                    <div className="space-y-2">
                        <Label>Prompt</Label>
                        <Textarea
                            value={data.prompt}
                            onChange={(e) =>
                                setData({ ...data, prompt: e.target.value })
                            }
                            placeholder="Ask a quick question…"
                        />
                        <InputError
                            message={errors.prompt}
                            className="text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <Label>Background</Label>
                        <BackgroundPicker
                            value={data.background}
                            onChange={(v) =>
                                setData({ ...data, background: v })
                            }
                        />
                        <InputError
                            message={errors.background}
                            className="text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Time (s)</Label>
                            <Input
                                type="number"
                                value={data.time_limit ?? 15}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        time_limit: parseInt(
                                            e.target.value || '15',
                                            10,
                                        ),
                                    })
                                }
                            />
                            <InputError
                                message={errors.time_limit}
                                className="text-xs"
                            />
                        </div>
                        <div>
                            <Label>Max Points</Label>
                            <Input
                                type="number"
                                value={data.max_points?.toString() ?? '0'}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        max_points: parseInt(
                                            e.target.value || '0',
                                            10,
                                        ),
                                    })
                                }
                            />
                            <InputError
                                message={errors.max_points}
                                className="text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Type-specific settings</Label>
                        <TypeEditors
                            data={data}
                            setData={setData}
                            errors={errors}
                        />
                    </div>

                    <div className="pt-2">
                        <Button type="button" onClick={handleSubmit}>
                            Create Short
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
