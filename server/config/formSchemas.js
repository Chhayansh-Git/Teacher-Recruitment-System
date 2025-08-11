/**
 * formSchemas.js
 *
 * Single source of truth for candidate-registration fields.
 * Organised by category ("teaching" | "nonTeaching") and then by position.
 *
 * Each field definition:
 *   name   – internal key
 *   label  – human-readable label
 *   type   – text | number | select | multiselect | file | textarea | date
 *   options – array for select / multiselect
 */

const formSchemas = {
  teaching: {
    'KG Teacher': [
      {
        name: 'highestDegree',
        label: 'Highest Degree',
        type: 'select',
        options: ['Diploma in Early Childhood', 'B.Ed', 'M.Ed']
      },
      {
        name: 'totalExperience',
        label: 'Years of Teaching Experience',
        type: 'number'
      },
      {
        name: 'subjects',
        label: 'Subjects Comfortable Teaching',
        type: 'multiselect',
        options: ['Basic Math', 'English', 'Drawing', 'Storytelling']
      },
      {
        name: 'skills',
        label: 'Skills',
        type: 'multiselect',
        options: ['Patience', 'Child Psychology', 'Storytelling', 'Play-based Learning']
      }
    ],

    'Primary Teacher': [
      {
        name: 'highestDegree',
        label: 'Highest Degree',
        type: 'select',
        options: ['Diploma', 'B.Ed', 'M.Ed']
      },
      {
        name: 'totalExperience',
        label: 'Years of Experience',
        type: 'number'
      },
      {
        name: 'subjects',
        label: 'Subjects of Expertise',
        type: 'multiselect',
        options: ['English', 'Hindi', 'Math', 'EVS']
      },
      {
        name: 'skills',
        label: 'Skills',
        type: 'multiselect',
        options: ['Multigrade Teaching', 'Curriculum Design', 'Communication Skills']
      }
    ],

    'TGT (Trained Graduate Teacher)': [
      {
        name: 'highestDegree',
        label: 'Highest Degree',
        type: 'select',
        options: ['B.Ed', 'B.A.', 'B.Sc.']
      },
      {
        name: 'subjects',
        label: 'Subject Specialization',
        type: 'select',
        options: ['Math', 'Science', 'English', 'Social Science', 'Computer']
      },
      {
        name: 'totalExperience',
        label: 'Years of Teaching Experience',
        type: 'number'
      },
      {
        name: 'skills',
        label: 'Skills',
        type: 'multiselect',
        options: ['Subject Mastery', 'Interactive Teaching', 'Assessment Design']
      }
    ],

    'PGT (Post Graduate Teacher)': [
      {
        name: 'highestDegree',
        label: 'Highest Degree',
        type: 'select',
        options: ['M.A.', 'M.Sc.', 'M.Com', 'M.Ed', 'Ph.D']
      },
      {
        name: 'subjects',
        label: 'PG Subject',
        type: 'select',
        options: [
          'Math',
          'Physics',
          'Chemistry',
          'Biology',
          'History',
          'Geography',
          'Economics',
          'English',
          'Computer Science'
        ]
      },
      {
        name: 'totalExperience',
        label: 'Years of Teaching Experience',
        type: 'number'
      },
      {
        name: 'skills',
        label: 'Skills',
        type: 'multiselect',
        options: ['Academic Research', 'Lesson Planning', 'Board Exam Preparation']
      }
    ],

    'Special Educator': [
      {
        name: 'highestDegree',
        label: 'Highest Degree',
        type: 'select',
        options: [
          'B.Ed in Special Education',
          'Diploma in Special Education',
          'M.Ed in Special Education'
        ]
      },
      {
        name: 'totalExperience',
        label: 'Years of Experience',
        type: 'number'
      },
      {
        name: 'skills',
        label: 'Core Skills',
        type: 'multiselect',
        options: [
          'IEP Development',
          'Disability Handling',
          'Behavioral Management',
          'Inclusive Teaching'
        ]
      }
    ],

    'Physical Education Teacher': [
      {
        name: 'highestDegree',
        label: 'Qualification',
        type: 'select',
        options: ['B.P.Ed', 'M.P.Ed']
      },
      {
        name: 'totalExperience',
        label: 'Years of Coaching/Teaching',
        type: 'number'
      },
      {
        name: 'skills',
        label: 'Sports Expertise',
        type: 'multiselect',
        options: ['Athletics', 'Football', 'Basketball', 'Yoga', 'Volleyball', 'Cricket']
      }
    ],

    'Art & Craft Teacher': [
      {
        name: 'highestDegree',
        label: 'Qualification',
        type: 'select',
        options: ['Diploma in Art', 'BFA', 'MFA']
      },
      {
        name: 'skills',
        label: 'Art Forms',
        type: 'multiselect',
        options: ['Painting', 'Sketching', 'Sculpting', 'Craft Making', 'Origami']
      },
      {
        name: 'portfolio',
        label: 'Upload Portfolio',
        type: 'file'
      }
    ],

    'Music Teacher': [
      {
        name: 'highestDegree',
        label: 'Music Qualification',
        type: 'select',
        options: ['Diploma in Music', 'B.A. Music', 'M.A. Music']
      },
      {
        name: 'skills',
        label: 'Music Skills',
        type: 'multiselect',
        options: ['Vocals', 'Harmonium', 'Tabla', 'Guitar', 'Keyboard']
      },
      {
        name: 'experienceDetails',
        label: 'Experience Summary',
        type: 'textarea'
      }
    ]
  },

  nonTeaching: {
    Librarian: [
      {
        name: 'highestDegree',
        label: 'Qualification',
        type: 'select',
        options: ['B.Lib', 'M.Lib']
      },
      {
        name: 'totalExperience',
        label: 'Years of Experience',
        type: 'number'
      },
      {
        name: 'skills',
        label: 'Library Skills',
        type: 'multiselect',
        options: ['Cataloging', 'Digital Library Tools', 'Library Management System']
      }
    ],

    'Lab Technician': [
      {
        name: 'highestDegree',
        label: 'Qualification',
        type: 'select',
        options: ['Diploma in Lab Tech', 'B.Sc.', 'M.Sc.']
      },
      {
        name: 'certifications',
        label: 'Relevant Certifications',
        type: 'file'
      },
      {
        name: 'skills',
        label: 'Equipment Handling',
        type: 'multiselect',
        options: ['Microscope', 'Centrifuge', 'Chemical Storage', 'Safety Protocols']
      },
      {
        name: 'totalExperience',
        label: 'Years of Lab Experience',
        type: 'number'
      }
    ],

    'Clerk / Office Assistant': [
      {
        name: 'highestDegree',
        label: 'Qualification',
        type: 'select',
        options: ['12th', 'Diploma', 'Bachelor’s']
      },
      {
        name: 'skills',
        label: 'Office Tools',
        type: 'multiselect',
        options: ['Typing', 'MS Word', 'Excel', 'Google Docs', 'Record Keeping']
      },
      {
        name: 'totalExperience',
        label: 'Years of Experience',
        type: 'number'
      }
    ],

    Receptionist: [
      {
        name: 'highestDegree',
        label: 'Qualification',
        type: 'select',
        options: ['12th', 'Bachelor’s']
      },
      {
        name: 'skills',
        label: 'Reception Skills',
        type: 'multiselect',
        options: ['Verbal Communication', 'Call Handling', 'Front Desk', 'Visitor Management']
      },
      {
        name: 'languageProficiency',
        label: 'Languages Spoken',
        type: 'multiselect',
        options: ['English', 'Hindi', 'Regional Language']
      }
    ],

    'IT Support Staff': [
      {
        name: 'highestDegree',
        label: 'IT Qualification',
        type: 'select',
        options: ['Diploma in IT', 'BCA', 'MCA', 'B.Sc. CS']
      },
      {
        name: 'skills',
        label: 'Technical Skills',
        type: 'multiselect',
        options: [
          'Networking',
          'Troubleshooting',
          'Hardware Setup',
          'Software Installation',
          'LAN/WAN'
        ]
      },
      {
        name: 'certifications',
        label: 'Upload Certificates',
        type: 'file'
      }
    ],

    Accountant: [
      {
        name: 'highestDegree',
        label: 'Commerce Degree',
        type: 'select',
        options: ['B.Com', 'M.Com', 'CA (Inter)']
      },
      {
        name: 'skills',
        label: 'Accounting Skills',
        type: 'multiselect',
        options: ['Tally', 'GST', 'Bookkeeping', 'MS Excel']
      },
      {
        name: 'totalExperience',
        label: 'Years of Accounting Experience',
        type: 'number'
      }
    ],

    'Security Staff': [
      {
        name: 'experienceDetails',
        label: 'Previous Experience',
        type: 'textarea'
      },
      {
        name: 'certifications',
        label: 'Upload ID or Police Verification',
        type: 'file'
      },
      {
        name: 'skills',
        label: 'Security Skills',
        type: 'multiselect',
        options: ['Crowd Handling', 'Emergency Response', 'Gate Keeping']
      }
    ],

    'Housekeeping Staff': [
      {
        name: 'experienceDetails',
        label: 'Previous Work Details',
        type: 'textarea'
      },
      {
        name: 'skills',
        label: 'Housekeeping Skills',
        type: 'multiselect',
        options: ['Cleaning', 'Dusting', 'Sanitation', 'Waste Management']
      }
    ]
  }
};

export default formSchemas;