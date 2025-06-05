import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Users, Globe, Award, Trash2, AlertTriangle } from 'lucide-react';
import { getTeamMembers, deleteTeamMember } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const AboutPage = () => {
  const { currentUser, isAdmin, isDeveloper } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const members = await getTeamMembers();
      setTeamMembers(members);
      setError('');
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTeamMember(selectedMember.id);
      setTeamMembers(prev => prev.filter(member => member.id !== selectedMember.id));
      setShowDeleteConfirm(false);
      setSelectedMember(null);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-success-500 text-white px-6 py-3 rounded-lg shadow-lg';
      successMessage.textContent = 'Team member deleted successfully';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    } catch (error) {
      console.error('Error deleting team member:', error);
      setError('Failed to delete team member');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary-600 dark:bg-primary-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
          <img
            src="https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Library interior"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
              About Book World
            </h1>
            <p className="text-xl text-white/90">
              Your premier destination for quality books, where stories come to life and imagination knows no bounds.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-heading">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              At Book World, we believe in the transformative power of books. Our mission is to connect readers with stories that inspire, educate, and entertain. We curate a diverse collection of books to ensure every reader finds their perfect match.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-24 justify-center items-center ">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <Book className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Books Available</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Happy Customers</p>
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <Globe className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50+</h3>
              <p className="text-gray-600 dark:text-gray-300">Countries Served</p>
            </motion.div> */}

            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <Award className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">25+</h3>
              <p className="text-gray-600 dark:text-gray-300">Industry Awards</p>
            </motion.div> */}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Meet the passionate individuals who make Book World possible. Our team of book lovers is dedicated to bringing you the best reading experience.
            </p>
          </motion.div>

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-error-500 dark:text-error-400 mr-2" />
                <p className="text-error-700 dark:text-error-200">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg relative group"
              >
                <img
                  src={member.imageUrl || "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"}
                  alt={member.name}
                  className="w-full h-64 object-top"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
                  {member.bio && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                      {member.bio}
                    </p>
                  )}
                </div>
                {isAdmin || isDeveloper && (
                  <button
                    onClick={() => handleDeleteClick(member)}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteConfirm(false)}></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 overflow-hidden shadow-xl">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Delete Team Member
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete {selectedMember.name}? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteConfirm}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Values Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide us in our mission to bring the best books to our readers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality",
                description: "We carefully curate our collection to ensure only the highest quality books make it to our shelves."
              },
              {
                title: "Accessibility",
                description: "Making great literature accessible to everyone through competitive pricing and worldwide shipping."
              },
              {
                title: "Community",
                description: "Building a community of readers and fostering meaningful discussions around literature."
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;