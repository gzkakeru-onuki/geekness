"use client";
import { useState } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function SchedulePage() {
    const [events, setEvents] = useState([
        {
            title: '面接: 田中太郎',
            start: new Date(2023, 2, 15, 10, 0), // 年, 月 (0-11), 日, 時, 分
            end: new Date(2023, 2, 15, 11, 0),
        },
        {
            title: '面接: 山田花子',
            start: new Date(2023, 2, 16, 14, 0),
            end: new Date(2023, 2, 16, 15, 0),
        },
    ]);

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">面接スケジュール管理</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    messages={{
                        next: "次",
                        previous: "前",
                        today: "今日",
                        month: "月",
                        week: "週",
                        day: "日",
                        agenda: "予定",
                    }}
                />
            </div>
        </div>
    );
}
