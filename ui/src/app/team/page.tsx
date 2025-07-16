'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Activity,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Clock,
} from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Senior Migration Engineer',
    department: 'Infrastructure',
    status: 'active',
    avatar: null,
    location: 'San Francisco, CA',
    joinDate: '2023-01-15',
    lastActive: '2 hours ago',
    projects: ['AWS Migration', 'Database Optimization'],
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Python'],
    phone: '+1 (555) 123-4567'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@company.com',
    role: 'Cloud Architect',
    department: 'Architecture',
    status: 'active',
    avatar: null,
    location: 'Austin, TX',
    joinDate: '2022-11-08',
    lastActive: '30 minutes ago',
    projects: ['Multi-Cloud Strategy', 'Security Implementation'],
    skills: ['Azure', 'GCP', 'Security', 'Architecture'],
    phone: '+1 (555) 987-6543'
  },
  {
    id: 3,
    name: 'Emily Johnson',
    email: 'emily.johnson@company.com',
    role: 'DevOps Engineer',
    department: 'Operations',
    status: 'active',
    avatar: null,
    location: 'New York, NY',
    joinDate: '2023-03-22',
    lastActive: '1 hour ago',
    projects: ['CI/CD Pipeline', 'Monitoring Setup'],
    skills: ['Jenkins', 'Docker', 'Monitoring', 'Linux'],
    phone: '+1 (555) 456-7890'
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'Data Engineer',
    department: 'Data',
    status: 'away',
    avatar: null,
    location: 'Seattle, WA',
    joinDate: '2022-09-12',
    lastActive: '1 day ago',
    projects: ['Data Lake Migration', 'ETL Optimization'],
    skills: ['Python', 'Spark', 'SQL', 'BigQuery'],
    phone: '+1 (555) 234-5678'
  },
  {
    id: 5,
    name: 'Lisa Park',
    email: 'lisa.park@company.com',
    role: 'Security Specialist',
    department: 'Security',
    status: 'active',
    avatar: null,
    location: 'Boston, MA',
    joinDate: '2023-05-10',
    lastActive: '15 minutes ago',
    projects: ['Security Audit', 'Compliance Framework'],
    skills: ['Security', 'Compliance', 'Risk Assessment', 'Penetration Testing'],
    phone: '+1 (555) 345-6789'
  }
];

const departments = ['All', 'Infrastructure', 'Architecture', 'Operations', 'Data', 'Security'];
const statuses = ['All', 'active', 'away', 'offline'];

export default function TeamPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'All' || member.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700';
      case 'away':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'offline':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 dark:bg-emerald-900/200';
      case 'away':
        return 'bg-amber-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">e
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Team Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Manage your migration team members and their assignments
            </p>
          </div>
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Total Members</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamMembers.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Across all departments</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Active Now</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {teamMembers.filter(m => m.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Currently online</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Departments</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {new Set(teamMembers.map(m => m.department)).size}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Different teams</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Avg. Tenure</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">1.2</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Years with company</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 dark:from-gray-900 dark:to-gray-8000 to-purple-600 dark:from-blue-700 dark:to-purple-800 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusDot(member.status)}`} />
                  <button className="p-1 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  {member.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Activity className="h-4 w-4" />
                  Last active: {member.lastActive}
                </div>
              </div>

              <div className="mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                  {member.department}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Current Projects</h4>
                <div className="space-y-1">
                  {member.projects.slice(0, 2).map((project, index) => (
                    <div key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                      {project}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{member.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                  <Mail className="h-4 w-4" />
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No team members found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or add new team members.</p>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 dark:from-gray-900 dark:to-gray-8000 to-purple-600 dark:from-blue-700 dark:to-purple-800 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedMember.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedMember.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.location}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Work Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{selectedMember.department}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">Joined {selectedMember.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">Last active {selectedMember.lastActive}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Current Projects</h3>
                <div className="space-y-2">
                  {selectedMember.projects.map((project, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{project}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Mail className="h-4 w-4" />
                Send Message
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
