import React, { useState } from 'react';
import { BookOpen, Users, Award, PlayCircle, Plus, Search, Filter, CheckCircle2, Download } from 'lucide-react';

const courses = [
  { id: 'CRS-01', title: 'Introduction to Cybersecurity', level: 'Beginner', students: 120, status: 'Active', type: 'Free' },
  { id: 'CRS-02', title: 'Cybersecurity Essentials', level: 'Intermediate', students: 85, status: 'Active', type: 'Paid' },
  { id: 'CRS-03', title: 'Ethical Hacking with Nmap', level: 'Advanced', students: 45, status: 'Active', type: 'Paid' },
  { id: 'CRS-04', title: 'Cybersecurity for Professionals', level: 'Advanced', students: 0, status: 'Draft', type: 'Paid' },
];

const certificates = [
  { id: 'CERT-001', student: 'Rahim Islam', course: 'Introduction to Cybersecurity', date: '2024-03-10', status: 'Issued', grade: 'A' },
  { id: 'CERT-002', student: 'Sadia Rahman', course: 'Introduction to Cybersecurity', date: '2024-03-12', status: 'Issued', grade: 'B+' },
  { id: 'CERT-003', student: 'Tanvir Hossain', course: 'Cybersecurity Essentials', date: '2024-03-15', status: 'Pending Review', grade: 'A' },
  { id: 'CERT-004', student: 'Nusrat Jahan', course: 'Ethical Hacking with Nmap', date: '2024-03-18', status: 'Issued', grade: 'A+' },
];

export function Education() {
  const [activeTab, setActiveTab] = useState<'courses' | 'certificates'>('courses');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Education & Courses</h1>
          <p className="text-sm text-slate-400">Manage BongoDemy cybersecurity training programs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Students Trained</p>
            <p className="text-2xl font-bold text-white">250+</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Active Courses</p>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Certificates Issued</p>
            <p className="text-2xl font-bold text-white">180</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Live Workshops</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1E2D40] border border-slate-700 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-700 bg-slate-800/30 flex items-center p-2">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'courses' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Course Directory
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'certificates' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Certification Tracker
          </button>
        </div>

        {activeTab === 'courses' ? (
          <div>
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Course Management</h2>
              <div className="flex items-center gap-3">
                 <div className="relative hidden sm:block">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="text" placeholder="Search courses..." className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]" />
                 </div>
                 <button className="flex items-center gap-2 px-4 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#0ED7A8]/90 transition-colors">
                   <Plus className="w-4 h-4" /> Add Course
                 </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-800/30 text-slate-400 text-sm">
                      <th className="px-6 py-4 font-medium">Course Title</th>
                      <th className="px-6 py-4 font-medium">Level</th>
                      <th className="px-6 py-4 font-medium">Students enrolled</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium"></th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                   {courses.map(course => (
                     <tr key={course.id} className="border-t border-slate-700/50 hover:bg-slate-800/20 transition-colors">
                       <td className="px-6 py-4">
                         <div className="font-medium text-white">{course.title}</div>
                         <div className="text-xs text-slate-500 mt-0.5">{course.id}</div>
                       </td>
                       <td className="px-6 py-4 text-slate-300">{course.level}</td>
                       <td className="px-6 py-4 text-slate-300">{course.students}</td>
                       <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-medium border ${course.type === 'Free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                           {course.type}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${course.status === 'Active' ? 'text-[#0ED7A8]' : 'text-slate-400'}`}>
                            {course.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="text-[#0ED7A8] hover:text-[#0ED7A8]/80 text-sm font-medium">Manage</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Certificates & Graduation</h2>
              <div className="flex items-center gap-3">
                 <div className="relative hidden sm:block">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="text" placeholder="Search students..." className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]" />
                 </div>
                 <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-600">
                   <Filter className="w-4 h-4" /> Filter
                 </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-800/30 text-slate-400 text-sm">
                      <th className="px-6 py-4 font-medium">Certificate ID</th>
                      <th className="px-6 py-4 font-medium">Student Name</th>
                      <th className="px-6 py-4 font-medium">Course Completed</th>
                      <th className="px-6 py-4 font-medium">Grade</th>
                      <th className="px-6 py-4 font-medium">Issue Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium"></th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                   {certificates.map(cert => (
                     <tr key={cert.id} className="border-t border-slate-700/50 hover:bg-slate-800/20 transition-colors">
                       <td className="px-6 py-4 font-mono text-xs text-slate-400">{cert.id}</td>
                       <td className="px-6 py-4 font-medium text-white">{cert.student}</td>
                       <td className="px-6 py-4 text-slate-300">{cert.course}</td>
                       <td className="px-6 py-4">
                         <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded">{cert.grade}</span>
                       </td>
                       <td className="px-6 py-4 text-slate-300">{cert.date}</td>
                       <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-medium ${cert.status === 'Issued' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {cert.status === 'Issued' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />}
                            {cert.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-white p-2" title="Download Certificate">
                            <Download className="w-4 h-4" />
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
