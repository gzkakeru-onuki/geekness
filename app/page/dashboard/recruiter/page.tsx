"use client";
import { useState } from "react";

interface Company {
    id: number;
    companyName: string;
    contact: string;
    industry: string;
    jobOpenings: string;
    location: string;
    applicationDeadline: string;
}

export default function CompanyListPage() {
    const [companies] = useState<Company[]>([
        {
            id: 1,
            companyName: "Tech Innovators Inc.",
            contact: "contact@techinnovators.com",
            industry: "Software Development",
            jobOpenings: "Frontend Developer, Backend Developer",
            location: "Tokyo, Japan",
            applicationDeadline: "2023-04-01",
        },
        {
            id: 2,
            companyName: "Data Solutions Ltd.",
            contact: "info@datasolutions.com",
            industry: "Data Science",
            jobOpenings: "Data Analyst, Data Engineer",
            location: "Osaka, Japan",
            applicationDeadline: "2023-04-15",
        },
        // 他の企業データをここに追加
    ]);

    return (
        <div className="flex h-screen">
            <div className="w-full bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">企業情報一覧</h1>
                <div className="w-full bg-white p-8 rounded-lg shadow-lg overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-blue-200">
                                <th className="py-2 px-4 text-center border-b border-gray-300">企業名</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">連絡先</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">業界</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">求人情報</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">所在地</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">応募締切</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company.id} className="border-t border-gray-300 hover:bg-gray-50">
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{company.companyName}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{company.contact}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{company.industry}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{company.jobOpenings}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{company.location}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{company.applicationDeadline}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
