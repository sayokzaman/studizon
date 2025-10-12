import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { useFetchList } from '@/hooks/use-fetch-list';
import AuthLayout from '@/layouts/auth-layout';
import { Course } from '@/types/course';
import { Department } from '@/types/department';
import { Program } from '@/types/program';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { route } from 'ziggy-js';

const initialFormData = {
    department: null as Department | null,
    program: null as Program | null,
    courses: [] as Course[],
};

const ProfileSetup = () => {
    const { data, setData, post, processing, errors } =
        useForm(initialFormData);

    const [searchDepartment, setSearchDepartment] = useState('');
    const [openDepartmentPopover, setOpenDepartmentPopover] = useState(false);

    const [searchProgram, setSearchProgram] = useState('');
    const [openProgramPopover, setOpenProgramPopover] = useState(false);

    const [searchCourse, setSearchCourse] = useState('');

    const widthRef = useRef<HTMLButtonElement>(null);

    // Fetch data whenever search changes
    const { data: departments, loading: deptLoading } =
        useFetchList<Department>({
            url: '/get-departments',
            search: searchDepartment,
        });

    const { data: programs, loading: progLoading } = useFetchList<
        Program,
        { department_id: number }
    >({
        url: '/get-programs',
        search: searchProgram,
        params: { department_id: data.department?.id ?? 0 },
        enabled: !!data.department,
    });

    // TODO: set course loading
    const { data: courses } = useFetchList<Course, { program_id: number }>({
        url: '/get-courses',
        search: searchCourse,
        params: { program_id: data.program?.id ?? 0 },
        enabled: !!data.program,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('setup.store'));
    };

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <div className="flex flex-col gap-6">
                <>
                    <div className="grid gap-6">
                        <div className="group relative grid gap-2">
                            <Label>Department</Label>
                            <Popover
                                open={openDepartmentPopover}
                                onOpenChange={setOpenDepartmentPopover}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        ref={widthRef}
                                    >
                                        {data.department ? (
                                            <>{data.department.name}</>
                                        ) : (
                                            <>Select Department</>
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
                                        {deptLoading && (
                                            <Spinner className="absolute top-2.5 right-4" />
                                        )}
                                        <CommandInput
                                            value={searchDepartment}
                                            onValueChange={setSearchDepartment}
                                            placeholder="Search Department..."
                                        />
                                        <CommandList>
                                            <CommandGroup
                                                className="max-h-60 overflow-y-auto"
                                                heading="Departments"
                                            >
                                                {departments.map(
                                                    (department) => (
                                                        <CommandItem
                                                            key={department.id}
                                                            value={department.id.toString()}
                                                            onSelect={(
                                                                value,
                                                            ) => {
                                                                setData(
                                                                    'department',
                                                                    departments.find(
                                                                        (
                                                                            dept,
                                                                        ) =>
                                                                            dept.id.toString() ===
                                                                            value,
                                                                    ) || null,
                                                                );
                                                                setData(
                                                                    'program',
                                                                    null,
                                                                );
                                                                setData(
                                                                    'courses',
                                                                    [],
                                                                );
                                                                setSearchProgram(
                                                                    '',
                                                                );
                                                                setSearchCourse(
                                                                    '',
                                                                );
                                                                setOpenDepartmentPopover(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            {department.name}
                                                        </CommandItem>
                                                    ),
                                                )}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <InputError
                                message={errors['department.id']}
                                className="mt-2"
                            />
                        </div>

                        <div className="group relative grid gap-2">
                            <Label>Program</Label>
                            <Popover
                                open={openProgramPopover}
                                onOpenChange={setOpenProgramPopover}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        ref={widthRef}
                                        disabled={!data.department}
                                    >
                                        {data.program ? (
                                            <>{data.program.name}</>
                                        ) : (
                                            <>Select Program</>
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
                                        {progLoading && (
                                            <Spinner className="absolute top-2.5 right-4" />
                                        )}
                                        <CommandInput
                                            value={searchProgram}
                                            onValueChange={setSearchProgram}
                                            placeholder="Search Department..."
                                        />
                                        <CommandList>
                                            <CommandGroup
                                                className="max-h-60 overflow-y-auto"
                                                heading="Programs"
                                            >
                                                {programs.map((program) => (
                                                    <CommandItem
                                                        key={program.id}
                                                        value={program.id.toString()}
                                                        onSelect={(value) => {
                                                            setData(
                                                                'program',
                                                                programs.find(
                                                                    (dept) =>
                                                                        dept.id.toString() ===
                                                                        value,
                                                                ) || null,
                                                            );
                                                            setData(
                                                                'courses',
                                                                [],
                                                            );
                                                            setSearchCourse('');
                                                            setOpenProgramPopover(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        {program.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <InputError
                                message={errors['program.id']}
                                className="mt-2"
                            />
                        </div>

                        <div className="group relative grid gap-2">
                            <Label>Cources</Label>

                            <MultiSelect
                                disabled={!data.program}
                                options={courses.map((course) => ({
                                    value: course.id.toString(),
                                    label: course.name,
                                }))}
                                searchValue={searchCourse}
                                onSearchChange={setSearchCourse}
                                value={data.courses?.map((course) =>
                                    course.id.toString(),
                                )}
                                onValueChange={(selected) => {
                                    const selectedCourseObjects =
                                        courses.filter((course) =>
                                            selected.includes(
                                                course.id.toString(),
                                            ),
                                        );

                                    setData('courses', selectedCourseObjects);
                                }}
                                maxCount={10}
                                placeholder="Select courses"
                                variant="inverted"
                                animation={2}
                                className="relative"
                            />
                            <InputError
                                message={errors['courses']}
                                className="mt-2"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            tabIndex={5}
                            data-test="register-user-button"
                            onClick={handleSubmit}
                        >
                            {processing && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            Complete Setup
                        </Button>
                    </div>
                </>
            </div>
        </AuthLayout>
    );
};

export default ProfileSetup;
