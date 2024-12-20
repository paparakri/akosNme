import { FaFire, FaGlassMartini, FaGraduationCap, FaGuitar, FaHeart, FaUsers } from "react-icons/fa";

// Constants for filter mapping
export const FILTER_MAPPING = {
    all: {
      id: 'all',
      label: 'All Venues',
      icon: FaGlassMartini,
      apiParam: 'all'
    },
    trending: {
      id: 'trending',
      label: 'Trending',
      icon: FaFire,
      apiParam: 'trending'
    },
    student: {
      id: 'student',
      label: 'Student Friendly',
      icon: FaGraduationCap,
      apiParam: 'student_friendly'
    },
    groups: {
      id: 'groups',
      label: 'Group Friendly',
      icon: FaUsers,
      apiParam: 'big_groups'
    },
    date: {
      id: 'date',
      label: 'Date Night',
      icon: FaHeart,
      apiParam: 'date_night'
    },
    live: {
      id: 'live',
      label: 'Live Music',
      icon: FaGuitar,
      apiParam: 'live_music'
    }
  };