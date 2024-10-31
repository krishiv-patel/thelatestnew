import React, { useEffect, useState } from 'react';
import { fetchUserContacts } from '../services/peopleService';

interface Contact {
  names?: { displayName: string }[];
  emailAddresses?: { value: string }[];
  phoneNumbers?: { value: string }[];
}

const ContactsList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data: Contact[] = await fetchUserContacts();
        setContacts(data);
      } catch (err) {
        setError('Failed to load contacts.');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  if (loading) return <p>Loading contacts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Contacts</h2>
      <ul>
        {contacts.map((contact, index) => (
          <li key={index} className="mb-2">
            <p><strong>Name:</strong> {contact.names?.[0]?.displayName || 'N/A'}</p>
            <p><strong>Email:</strong> {contact.emailAddresses?.[0]?.value || 'N/A'}</p>
            <p><strong>Phone:</strong> {contact.phoneNumbers?.[0]?.value || 'N/A'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactsList;
