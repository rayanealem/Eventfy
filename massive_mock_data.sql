-- ============================================================
-- EVENTFY — MASSIVE MOCK DATA (All Tables)
-- Paste into Supabase SQL Editor and run
-- ============================================================
-- This creates: 50 users, 20 orgs, 30 events, registrations,
-- volunteers, teams, chat channels with messages, stories,
-- notifications, badges, skills, connections, certificates,
-- posts, golden tickets, and XP transactions.
-- ============================================================

-- ═══════════════════════════════════════════════
-- 1) PROFILES (50 realistic Algerian users)
-- ═══════════════════════════════════════════════

DO $$
DECLARE
  uids UUID[];
  i INT;
  first_names TEXT[] := ARRAY['Yassine','Amine','Khaled','Sofiane','Rayan','Mehdi','Anis','Walid','Bilal','Nour',
    'Amira','Sara','Lina','Fatima','Houda','Meriem','Yasmine','Asma','Rania','Salma',
    'Hamza','Karim','Ilyass','Farid','Omar','Mourad','Tarek','Djamel','Nadir','Zakaria',
    'Imane','Ikram','Chaima','Hadjer','Nesrine','Souad','Lamia','Hiba','Wafa','Djamila',
    'Abdelkader','Mounir','Rachid','Sid Ahmed','Ayman','Ishak','Lotfi','Redouane','Fares','Nassim'];
  last_names TEXT[] := ARRAY['Benali','Bouzid','Mansouri','Haddad','Saadi','Kadir','Meziane','Yahia','Rahmani','Boudiaf',
    'Larbi','Cherif','Djebbar','Ait Ahmed','Slimani','Belkacem','Hamidi','Zeroual','Khelif','Mebarki',
    'Ferhat','Bensalem','Ouali','Medjdoub','Toumi','Berrahma','Chaoui','Bouchlaghem','Guedda','Redjimi',
    'Mokhtari','Benamor','Talbi','Amrouche','Laribi','Ameur','Saidi','Benhamed','Sellami','Zerhouni',
    'Boukhris','DjeDjelli','Hafid','Amrane','Bouazza','Boutaleb','Kaddour','Benmoussa','Zidane','Kerouani'];
  cities TEXT[] := ARRAY['Algiers','Oran','Constantine','Annaba','Blida','Batna','Djelfa','Sétif','Sidi Bel Abbès','Biskra',
    'Tébessa','El Oued','Skikda','Tiaret','Béjaïa','Tlemcen','Béchar','Ouargla','Mostaganem','Bordj Bou Arreridj'];
  universities TEXT[] := ARRAY['USTHB','Université Oran 1','Université Constantine','ESI','ENST','ENTP','ENSTP','Ecole Militaire Polytechnique','Université Blida','Université Béjaïa',
    'ENP Oran','Université Sétif','INSA Alger','Ecole Nationale Supérieure de Journalisme','HEC Alger','ENSI','Univ Tlemcen','Univ Annaba','EPST','Univ Ouargla'];
  shapes TEXT[] := ARRAY['circle','triangle','square','diamond'];
  bios TEXT[] := ARRAY[
    'Passionate about tech and hackathons 🚀','Student by day, coder by night 💻','Event organizer & community builder','Football lover ⚽ and hackathon veteran',
    'AI/ML enthusiast exploring the future','Building the next generation of apps','Science nerd and proud of it 🔬','Creative designer with a love for UI',
    'Full-stack developer & open source contributor','Dreaming big in Algiers ✨','Environmental activist & volunteer','Startup founder building for Africa',
    'Cybersecurity researcher 🔐','Data scientist in training','Cloud computing enthusiast ☁️','Music producer & event DJ 🎵',
    'Photography is my superpower 📸','Robotics engineer building the future 🤖','Blockchain developer since 2020','Gaming tournament champion 🎮',
    'Social entrepreneur making impact','Marathon runner & fitness coach 🏃','Arabic calligraphy artist ✍️','Public speaker & TEDx organizer',
    'Traveling Algeria one wilaya at a time 🗺️','Quantum computing researcher','Mobile app developer (React Native)','DevOps engineer automating everything',
    'Astronomy lover gazing at stars ⭐','Marine biology student 🐠','Architecture student designing cities','Civil engineer building bridges',
    'Mechanical engineering geek ⚙️','Biotechnology researcher 🧬','Economics student analyzing markets','Literature lover & book reviewer 📚',
    'Filmmaker & short film director 🎬','Graphic designer creating brands','Mathematics olympiad medalist 🏅','Chess champion & strategy game lover ♟️',
    'Volunteer coordinator for 5+ orgs','Cultural festival organizer','Debate champion & public policy nerd','Journalism student covering events',
    'Philosophy student questioning everything','Archaeology enthusiast digging history','Music theory student 🎼','Stand-up comedian in training 😂',
    'Esports team captain','Agricultural science innovator 🌱'];
BEGIN
  -- Generate 50 UUIDs
  uids := ARRAY(SELECT gen_random_uuid() FROM generate_series(1, 50));

  FOR i IN 1..50 LOOP
    -- Insert into auth.users (Supabase)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
      uids[i],
      '00000000-0000-0000-0000-000000000000',
      lower(first_names[i]) || '.' || lower(last_names[i]) || '@eventfy.test',
      crypt('password123', gen_salt('bf')),
      NOW(),
      jsonb_build_object('username', lower(first_names[i]) || lower(left(last_names[i], 3)), 'full_name', first_names[i] || ' ' || last_names[i]),
      'authenticated',
      'authenticated',
      NOW() - (random() * 180 * INTERVAL '1 day'),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Update profile with rich data (trigger creates basic profile)
    UPDATE profiles SET
      full_name = first_names[i] || ' ' || last_names[i],
      avatar_url = 'https://i.pravatar.cc/200?u=' || uids[i]::text,
      shape = shapes[1 + (i % 4)],
      shape_color = CASE (i % 5) WHEN 0 THEN '#FF2D78' WHEN 1 THEN '#13ECC8' WHEN 2 THEN '#FFD700' WHEN 3 THEN '#3B82F6' ELSE '#A78BFA' END,
      bio = bios[i],
      wilaya = cities[1 + (i % 20)],
      city = cities[1 + (i % 20)],
      is_student = (i <= 35),
      university = CASE WHEN i <= 35 THEN universities[1 + (i % 20)] ELSE NULL END,
      study_year = CASE WHEN i <= 35 THEN CASE (i % 5) WHEN 0 THEN 'L1' WHEN 1 THEN 'L2' WHEN 2 THEN 'L3' WHEN 3 THEN 'M1' ELSE 'M2' END ELSE NULL END,
      role = CASE
        WHEN i <= 5 THEN 'organizer'
        WHEN i = 50 THEN 'global_admin'
        ELSE 'participant'
      END,
      xp = 500 + floor(random() * 24500)::int,
      level = 1 + floor(random() * 9)::int,
      onboarding_done = TRUE,
      volunteer_available = (i % 3 != 0),
      updated_at = NOW()
    WHERE id = uids[i];
  END LOOP;

  -- ═══════════════════════════════════════════════
  -- 2) ORGANIZATIONS (20 orgs)
  -- ═══════════════════════════════════════════════
  DECLARE
    org_ids UUID[];
    org_names TEXT[] := ARRAY['Micro Club USTHB','GDG Algiers','IEEE USTHB','Enactus Algeria','CSE Club','Algeria Startup','Green Earth DZ',
      'GDSC Constantine','Blockchain Algeria','AI Community Oran','Réseau Algérien du Volontariat','Startup Weekend Algiers',
      'Women Techmakers Algiers','Code213','DevFest Blida','Hackathon Nation','ScienceHub Sétif','CyberSec Algeria',
      'DesignDZ Community','Sport Union USTHB'];
    org_types TEXT[] := ARRAY['university_club','company','university_club','ngo','university_club','company','ngo',
      'university_club','company','university_club','ngo','company',
      'ngo','company','university_club','company','university_club','company',
      'other','sports_club'];
    org_descs TEXT[] := ARRAY[
      'The premier tech community at USTHB, organizing hackathons, workshops, and conferences since 2009.',
      'Google Developer Group Algiers — Building a community of developers.',
      'IEEE USTHB Student Branch — Advancing technology for humanity.',
      'Enactus Algeria — Social entrepreneurship that transforms lives.',
      'Computer Science & Engineering Club at USTHB.',
      'Empowering the Algerian startup ecosystem with training and networking.',
      'Environmental organization focused on sustainability in Algeria.',
      'Google Developer Student Club at Université Constantine.',
      'Exploring blockchain technology and Web3 in Algeria.',
      'Artificial Intelligence community in Oran for researchers and enthusiasts.',
      'Connecting volunteers with opportunities across Algeria.',
      'Startup Weekend events across Algerian cities.',
      'Women Techmakers — Empowering women in tech in Algeria.',
      'Community of Algerian developers building for the 213.',
      'DevFest Blida — Annual developer festival in Blida.',
      'National hackathon organizing committee for all of Algeria.',
      'Science and innovation hub at Université Sétif.',
      'Cybersecurity awareness and training community.',
      'Design community for UI/UX and graphic designers in Algeria.',
      'University sports union organizing inter-university tournaments.'
    ];
  BEGIN
    org_ids := ARRAY(SELECT gen_random_uuid() FROM generate_series(1, 20));

    FOR i IN 1..20 LOOP
      INSERT INTO organizations (id, owner_id, name, slug, org_type, official_email, website, description, logo_url, cover_url, status, verified, follower_count, event_count, total_attendees, wilaya, city, founded_year)
      VALUES (
        org_ids[i],
        uids[1 + ((i-1) % 5)],
        org_names[i],
        lower(replace(replace(org_names[i], ' ', '-'), '''', '')),
        org_types[i],
        lower(replace(org_names[i], ' ', '')) || '@eventfy.test',
        'https://' || lower(replace(org_names[i], ' ', '')) || '.dz',
        org_descs[i],
        'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=400&fit=crop',
        'approved',
        (i <= 10),
        100 + floor(random() * 5000)::int,
        2 + floor(random() * 15)::int,
        200 + floor(random() * 15000)::int,
        cities[1 + ((i-1) % 20)],
        cities[1 + ((i-1) % 20)],
        2015 + (i % 10)
      );

      -- Add owner as org_member
      INSERT INTO org_members (org_id, user_id, role) VALUES (org_ids[i], uids[1 + ((i-1) % 5)], 'owner') ON CONFLICT DO NOTHING;
      -- Add 3 more members
      INSERT INTO org_members (org_id, user_id, role) VALUES (org_ids[i], uids[6 + ((i*3) % 44)], 'admin') ON CONFLICT DO NOTHING;
      INSERT INTO org_members (org_id, user_id, role) VALUES (org_ids[i], uids[6 + ((i*3+1) % 44)], 'member') ON CONFLICT DO NOTHING;
      INSERT INTO org_members (org_id, user_id, role) VALUES (org_ids[i], uids[6 + ((i*3+2) % 44)], 'member') ON CONFLICT DO NOTHING;

      -- Add random followers
      FOR j IN 1..20 LOOP
        INSERT INTO org_followers (org_id, user_id) VALUES (org_ids[i], uids[1 + ((i+j) % 50)]) ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;

    -- ═══════════════════════════════════════════════
    -- 3) EVENTS (30 events)
    -- ═══════════════════════════════════════════════
    DECLARE
      event_ids UUID[];
      evt_titles TEXT[] := ARRAY[
        'Algiers Hackathon 2026','Inter-Uni Football Cup','AI Summit Algeria','Climate Action Forum','Startup Pitch Night',
        'Cybersecurity CTF Challenge','Design Sprint Weekend','Ramadan Code Jam','Science Fair USTHB','Cultural Heritage Festival',
        'Women in Tech Conference','DevFest Algiers 2026','Mobile Dev Bootcamp','Blockchain Workshop','Robotics Competition',
        'Photography Marathon','Debate Championship','Music & Tech Festival','Marathon de Alger','E-Sports Tournament',
        'Data Science Meetup','Open Source Summit','Career Fair 2026','Innovation Week','IoT Hackathon',
        'Astro Night Observation','Marine Conservation Day','Arabic Calligraphy Workshop','Chess Tournament National','Film Festival Algiers'
      ];
      evt_types TEXT[] := ARRAY[
        'science','sport','science','charity','science',
        'science','cultural','science','science','cultural',
        'science','science','science','science','science',
        'cultural','cultural','cultural','sport','sport',
        'science','science','science','science','science',
        'science','charity','cultural','sport','cultural'
      ];
      cover_urls TEXT[] := ARRAY[
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800','https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
        'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800','https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800','https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800','https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800','https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800','https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800','https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800','https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800','https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
        'https://images.unsplash.com/photo-1461896836934-bd45ba8c4e5e?w=800','https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800','https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
        'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800','https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800','https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
        'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800','https://images.unsplash.com/photo-1596367407372-96cb88503dae?w=800',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800','https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800'
      ];
      j INT;
    BEGIN
      event_ids := ARRAY(SELECT gen_random_uuid() FROM generate_series(1, 30));

      FOR i IN 1..30 LOOP
        INSERT INTO events (id, org_id, created_by, title, slug, description, event_type, status, visibility, starts_at, ends_at, registration_closes_at, venue_name, wilaya, city, capacity, cover_url, tags, xp_checkin, xp_completion, xp_winner, registration_count, checkin_count, view_count, published_at)
        VALUES (
          event_ids[i],
          org_ids[1 + ((i-1) % 20)],
          uids[1 + ((i-1) % 5)],
          evt_titles[i],
          lower(replace(replace(evt_titles[i], ' ', '-'), '''', '')),
          'Join us for ' || evt_titles[i] || '! An incredible experience featuring workshops, competitions, networking, and prizes. Open to all students and professionals across Algeria.',
          evt_types[i],
          CASE WHEN i <= 10 THEN 'scheduled' WHEN i <= 20 THEN 'live' ELSE 'completed' END,
          'open',
          CASE WHEN i <= 10 THEN NOW() + (i * INTERVAL '7 days') WHEN i <= 20 THEN NOW() - (INTERVAL '2 hours') ELSE NOW() - ((i-20) * INTERVAL '14 days') END,
          CASE WHEN i <= 10 THEN NOW() + (i * INTERVAL '7 days') + INTERVAL '8 hours' WHEN i <= 20 THEN NOW() + INTERVAL '6 hours' ELSE NOW() - ((i-20) * INTERVAL '14 days') + INTERVAL '8 hours' END,
          CASE WHEN i <= 10 THEN NOW() + ((i-1) * INTERVAL '7 days') ELSE NULL END,
          CASE (i % 5) WHEN 0 THEN 'Salle des Conférences USTHB' WHEN 1 THEN 'Centre de Conventions Oran' WHEN 2 THEN 'Palais de la Culture Alger' WHEN 3 THEN 'Stade 5 Juillet' ELSE 'Campus Universitaire' END,
          cities[1 + ((i-1) % 20)],
          cities[1 + ((i-1) % 20)],
          50 + (i * 20),
          cover_urls[i],
          CASE evt_types[i] WHEN 'science' THEN ARRAY['tech','innovation','coding'] WHEN 'sport' THEN ARRAY['sports','competition','teamwork'] WHEN 'charity' THEN ARRAY['volunteer','community','social'] ELSE ARRAY['culture','arts','heritage'] END,
          100 + (i * 10),
          200 + (i * 20),
          500 + (i * 50),
          10 + floor(random() * 200)::int,
          5 + floor(random() * 100)::int,
          100 + floor(random() * 5000)::int,
          NOW() - (i * INTERVAL '3 days')
        );

        -- Ticket tiers for each event
        INSERT INTO event_ticket_tiers (event_id, name, tier_shape, price, perks, quantity, sold) VALUES
          (event_ids[i], 'STANDARD', '○', 0, 'General access, welcome kit', 100 + (i*10), floor(random()*50)::int),
          (event_ids[i], 'VIP', '◇', 2000 + (i*500), 'Front row, lunch included, certificate', 30 + (i*2), floor(random()*15)::int),
          (event_ids[i], 'PREMIUM', '□', 5000 + (i*1000), 'All VIP perks + dinner with speakers', 10, floor(random()*5)::int);

        -- Register 10-20 random users per event
        FOR j IN 1..LEAST(20, 10 + (i % 10)) LOOP
          INSERT INTO event_registrations (event_id, user_id, status, checked_in, checked_in_at, xp_awarded, registered_at)
          VALUES (
            event_ids[i],
            uids[1 + ((i+j) % 50)],
            'confirmed',
            (i > 20 AND j <= 8),
            CASE WHEN (i > 20 AND j <= 8) THEN NOW() - ((i-20) * INTERVAL '14 days') + INTERVAL '1 hour' ELSE NULL END,
            (i > 20 AND j <= 8),
            NOW() - (i * INTERVAL '5 days') + (j * INTERVAL '2 hours')
          ) ON CONFLICT DO NOTHING;
        END LOOP;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 4) VOLUNTEER ROLES & APPLICATIONS
      -- ═══════════════════════════════════════════════
      FOR i IN 1..15 LOOP
        DECLARE vrole_id UUID := gen_random_uuid();
        BEGIN
          INSERT INTO volunteer_roles (id, event_id, name, slots, filled, skills, perks)
          VALUES (vrole_id, event_ids[i], CASE (i%4) WHEN 0 THEN 'Registration Desk' WHEN 1 THEN 'Stage Manager' WHEN 2 THEN 'Photography' ELSE 'Technical Support' END,
            5, 2, ARRAY['communication','teamwork'], 'Certificate + 500 XP bonus');
          FOR j IN 1..3 LOOP
            INSERT INTO volunteer_applications (role_id, event_id, user_id, status)
            VALUES (vrole_id, event_ids[i], uids[30 + ((i+j) % 20)], CASE WHEN j=1 THEN 'approved' ELSE 'pending' END) ON CONFLICT DO NOTHING;
          END LOOP;
        END;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 5) TEAMS
      -- ═══════════════════════════════════════════════
      FOR i IN 1..10 LOOP
        DECLARE team_id UUID := gen_random_uuid();
        BEGIN
          INSERT INTO teams (id, event_id, name, code, leader_id, shape, color, max_members, is_public, is_ready, skills_needed)
          VALUES (team_id, event_ids[i],
            CASE (i%5) WHEN 0 THEN 'Team Alpha' WHEN 1 THEN 'Team Omega' WHEN 2 THEN 'Team Phoenix' WHEN 3 THEN 'Team Hydra' ELSE 'Team Nova' END || ' ' || i,
            'TEAM-' || upper(substring(gen_random_uuid()::text, 1, 8)),
            uids[i], shapes[1 + (i % 4)], '#13ECC8', 5, TRUE, (i%2=0),
            ARRAY['python','teamwork','problem-solving']);
          FOR j IN 1..3 LOOP
            INSERT INTO team_members (team_id, user_id, role) VALUES (team_id, uids[i + j], CASE WHEN j=1 THEN 'developer' ELSE 'designer' END) ON CONFLICT DO NOTHING;
          END LOOP;
        END;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 6) CHAT CHANNELS & MESSAGES
      -- ═══════════════════════════════════════════════
      FOR i IN 1..15 LOOP
        DECLARE ch_id UUID := gen_random_uuid();
        BEGIN
          INSERT INTO chat_channels (id, event_id, name, channel_type, shape)
          VALUES (ch_id, event_ids[i], evt_titles[i] || ' Chat', 'event', shapes[1+(i%4)]);

          -- 10+ messages per channel
          FOR j IN 1..12 LOOP
            INSERT INTO messages (channel_id, sender_id, content, msg_type, created_at)
            VALUES (
              ch_id,
              uids[1 + ((i+j) % 50)],
              CASE (j%8)
                WHEN 0 THEN 'Hey everyone! Excited for this event! 🔥'
                WHEN 1 THEN 'Can someone share the schedule?'
                WHEN 2 THEN 'The venue looks amazing from photos!'
                WHEN 3 THEN 'Anyone from Oran coming? We could carpool 🚗'
                WHEN 4 THEN 'Just registered! See you all there 🎉'
                WHEN 5 THEN 'Is there WiFi at the venue?'
                WHEN 6 THEN 'Reminder: bring your laptop and charger!'
                ELSE 'This is going to be legendary! Who''s ready? 💪'
              END,
              CASE WHEN j=5 THEN 'announcement' ELSE 'text' END,
              NOW() - ((15-i) * INTERVAL '2 days') + (j * INTERVAL '30 minutes')
            );
          END LOOP;
        END;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 7) STORIES & STORY FRAMES
      -- ═══════════════════════════════════════════════
      FOR i IN 1..20 LOOP
        DECLARE story_id UUID := gen_random_uuid();
        BEGIN
          INSERT INTO stories (id, org_id, event_id, audience, expires_at, view_count)
          VALUES (story_id, org_ids[i], event_ids[1+((i-1)%30)], 'followers', NOW() + INTERVAL '24 hours', 50 + floor(random()*500)::int);

          -- 2-4 frames per story
          FOR j IN 1..LEAST(4, 2+(i%3)) LOOP
            INSERT INTO story_frames (story_id, media_url, media_type, duration_ms, sort_order)
            VALUES (story_id,
              'https://images.unsplash.com/photo-' || (1500000000 + i*1000 + j*100)::text || '?w=600&h=1067&fit=crop',
              'image', 5000, j);
          END LOOP;

          -- Random views
          FOR j IN 1..10 LOOP
            INSERT INTO story_views (story_id, user_id) VALUES (story_id, uids[1+((i+j)%50)]) ON CONFLICT DO NOTHING;
          END LOOP;
        END;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 8) NOTIFICATIONS (varied types)
      -- ═══════════════════════════════════════════════
      FOR i IN 1..50 LOOP
        INSERT INTO notifications (user_id, type, title, body, data, is_read, created_at)
        VALUES (
          uids[i],
          CASE (i%12)
            WHEN 0 THEN 'event_update' WHEN 1 THEN 'registration_confirmed' WHEN 2 THEN 'event_starts_soon'
            WHEN 3 THEN 'new_follower' WHEN 4 THEN 'badge_earned' WHEN 5 THEN 'xp_gained'
            WHEN 6 THEN 'level_up' WHEN 7 THEN 'volunteer_approved' WHEN 8 THEN 'golden_ticket'
            WHEN 9 THEN 'flash_alert' WHEN 10 THEN 'new_message' ELSE 'connection_request'
          END,
          CASE (i%12)
            WHEN 0 THEN evt_titles[1+((i-1)%30)] || ' updated'
            WHEN 1 THEN 'Registration confirmed for ' || evt_titles[1+((i-1)%30)]
            WHEN 2 THEN evt_titles[1+((i-1)%30)] || ' starts in 1 hour!'
            WHEN 3 THEN first_names[1+((i+5)%50)] || ' started following you'
            WHEN 4 THEN 'Badge earned: PIONEER'
            WHEN 5 THEN '+250 XP earned from ' || evt_titles[1+((i-1)%30)]
            WHEN 6 THEN 'Level Up! You reached Level ' || (2+(i%8))
            WHEN 7 THEN 'Volunteer application approved!'
            WHEN 8 THEN '🎫 Golden Ticket from TechCorp!'
            WHEN 9 THEN '⚡ Flash: New event dropping in 30 minutes'
            WHEN 10 THEN 'New message in ' || evt_titles[1+((i-1)%30)] || ' chat'
            ELSE first_names[1+((i+3)%50)] || ' wants to connect'
          END,
          CASE (i%12)
            WHEN 0 THEN 'The event schedule has been updated. Check the new times.'
            WHEN 1 THEN 'You are confirmed! Show your QR code at the entrance.'
            WHEN 2 THEN 'Get ready — the event is about to begin.'
            WHEN 3 THEN 'You have a new follower on your profile.'
            WHEN 4 THEN 'You earned the Pioneer badge for attending 5 events.'
            WHEN 5 THEN 'Your XP balance has increased.'
            WHEN 6 THEN 'Congratulations on reaching a new level!'
            WHEN 7 THEN 'Your volunteer application has been approved.'
            WHEN 8 THEN 'A recruiter wants to connect with you.'
            WHEN 9 THEN 'A new flash event is being announced.'
            WHEN 10 THEN 'Someone sent a message in your event chat.'
            ELSE 'A user wants to connect with you on Eventfy.'
          END,
          jsonb_build_object('event_id', event_ids[1+((i-1)%30)]::text),
          (i % 3 = 0),
          NOW() - (i * INTERVAL '6 hours')
        );
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 9) BADGES & USER BADGES
      -- ═══════════════════════════════════════════════
      DECLARE badge_ids UUID[];
      badge_names TEXT[] := ARRAY['Pioneer','First Blood','Social Butterfly','Hackathon Veteran','Event Regular',
        'Volunteer Hero','Speed Demon','Night Owl','Marathon Runner','Golden Graduate',
        'Community Builder','Top Contributor','Creative Mind','Data Wizard','Security Expert'];
      badge_descs TEXT[] := ARRAY['Attended 5+ events','Won your first competition','Connected with 20+ users','Participated in 3+ hackathons','Attended 10+ events',
        'Volunteered at 5+ events','Completed 3 events in one week','Stayed past midnight at an event','Attended events in 5+ wilayas','Graduated from Eventfy academy',
        'Founded or co-managed an org','Top 10 in leaderboard','Won a design competition','Excelled in data science challenge','CTF challenge winner'];
      badge_icons TEXT[] := ARRAY['🏅','⚔️','🦋','💻','📅','🤝','⚡','🌙','🏃','🎓','🏗️','⭐','🎨','📊','🔐'];
      BEGIN
        badge_ids := ARRAY(SELECT gen_random_uuid() FROM generate_series(1, 15));
        FOR i IN 1..15 LOOP
          INSERT INTO badges (id, name, description, icon_url, shape, color, xp_value)
          VALUES (badge_ids[i], badge_names[i], badge_descs[i], badge_icons[i],
            shapes[1+(i%4)], CASE (i%4) WHEN 0 THEN '#FFD700' WHEN 1 THEN '#13ECC8' WHEN 2 THEN '#FF2D78' ELSE '#3B82F6' END,
            100 + (i * 50));
        END LOOP;

        -- Award badges to users
        FOR i IN 1..50 LOOP
          FOR j IN 1..LEAST(5, 1+(i%5)) LOOP
            INSERT INTO user_badges (user_id, badge_id, event_id, earned_at)
            VALUES (uids[i], badge_ids[1+((i+j)%15)], event_ids[1+((i+j)%30)], NOW() - ((50-i) * INTERVAL '2 days'))
            ON CONFLICT DO NOTHING;
          END LOOP;
        END LOOP;
      END;

      -- ═══════════════════════════════════════════════
      -- 10) XP TRANSACTIONS
      -- ═══════════════════════════════════════════════
      FOR i IN 1..50 LOOP
        FOR j IN 1..5 LOOP
          INSERT INTO xp_transactions (user_id, amount, reason, event_id, created_at)
          VALUES (uids[i], 50 + floor(random()*450)::int,
            CASE (j%5) WHEN 0 THEN 'Event check-in' WHEN 1 THEN 'Event completion' WHEN 2 THEN 'Badge earned' WHEN 3 THEN 'Volunteer bonus' ELSE 'Daily login streak' END,
            event_ids[1+((i+j)%30)],
            NOW() - ((50-i) * INTERVAL '1 day') + (j * INTERVAL '6 hours'));
        END LOOP;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 11) SKILLS & USER SKILLS
      -- ═══════════════════════════════════════════════
      DECLARE skill_ids UUID[];
      skill_names TEXT[] := ARRAY['Python','JavaScript','React','Machine Learning','Public Speaking','Project Management','UI/UX Design','Data Analysis','Cybersecurity','DevOps',
        'Leadership','Event Planning','Photography','Video Editing','Content Writing'];
      skill_cats TEXT[] := ARRAY['tech','tech','tech','tech','social','leadership','tech','tech','tech','tech',
        'leadership','leadership','other','other','other'];
      BEGIN
        skill_ids := ARRAY(SELECT gen_random_uuid() FROM generate_series(1, 15));
        FOR i IN 1..15 LOOP
          INSERT INTO skills (id, name, category) VALUES (skill_ids[i], skill_names[i], skill_cats[i]) ON CONFLICT DO NOTHING;
        END LOOP;
        FOR i IN 1..50 LOOP
          FOR j IN 1..LEAST(5, 2+(i%4)) LOOP
            INSERT INTO user_skills (user_id, skill_id, verified) VALUES (uids[i], skill_ids[1+((i+j)%15)], (j<=2)) ON CONFLICT DO NOTHING;
          END LOOP;
        END LOOP;
      END;

      -- ═══════════════════════════════════════════════
      -- 12) CONNECTIONS (Social Graph)
      -- ═══════════════════════════════════════════════
      FOR i IN 1..40 LOOP
        INSERT INTO connections (requester_id, addressee_id, status, created_at)
        VALUES (uids[i], uids[1+((i+3)%50)],
          CASE WHEN i<=30 THEN 'accepted' ELSE 'pending' END,
          NOW() - (i * INTERVAL '12 hours'))
        ON CONFLICT DO NOTHING;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 13) POSTS (Org Posts)
      -- ═══════════════════════════════════════════════
      FOR i IN 1..20 LOOP
        FOR j IN 1..3 LOOP
          INSERT INTO posts (org_id, author_id, post_type, content, media_urls, published_at, like_count, comment_count)
          VALUES (
            org_ids[i],
            uids[1+((i-1)%5)],
            CASE WHEN j=1 THEN 'announcement' ELSE 'update' END,
            CASE (j%3)
              WHEN 0 THEN '🎉 We are thrilled to announce our upcoming event! Stay tuned for more details. #Eventfy #Algeria'
              WHEN 1 THEN '📸 Throwback to our last event! Thank you to everyone who participated. What an incredible turnout!'
              ELSE '🚀 Registration is now open! Limited spots available. Link in bio. Don''t miss out!'
            END,
            ARRAY['https://images.unsplash.com/photo-' || (1500000000 + i*100 + j*10)::text || '?w=600'],
            NOW() - ((20-i) * INTERVAL '3 days') + (j * INTERVAL '8 hours'),
            10 + floor(random()*200)::int,
            2 + floor(random()*30)::int
          );
        END LOOP;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 14) CERTIFICATES
      -- ═══════════════════════════════════════════════
      FOR i IN 21..30 LOOP  -- completed events only
        FOR j IN 1..5 LOOP
          INSERT INTO certificates (user_id, event_id, org_id, role, verification_code, issued_at)
          VALUES (uids[j + ((i-21)*5)], event_ids[i], org_ids[1+((i-1)%20)],
            CASE WHEN j=1 THEN 'winner' WHEN j=2 THEN 'runner-up' ELSE 'participant' END,
            'CERT-' || upper(substring(gen_random_uuid()::text, 1, 12)),
            NOW() - ((i-20) * INTERVAL '10 days'))
          ON CONFLICT DO NOTHING;
        END LOOP;
      END LOOP;

      -- ═══════════════════════════════════════════════
      -- 15) GOLDEN TICKETS
      -- ═══════════════════════════════════════════════
      FOR i IN 1..5 LOOP
        INSERT INTO golden_tickets (recruiter_id, candidate_id, company_name, message, status)
        VALUES (
          uids[46 + (i%4)],
          uids[i],
          CASE i WHEN 1 THEN 'Google Algeria' WHEN 2 THEN 'Yassir' WHEN 3 THEN 'Djezzy Labs' WHEN 4 THEN 'Cevital Tech' ELSE 'Ooredoo Innovation' END,
          'We were impressed by your performance at ' || evt_titles[20+i] || '. We''d love to discuss opportunities.',
          CASE WHEN i<=3 THEN 'sent' ELSE 'accepted' END
        );
      END LOOP;

    END;
  END;
END $$;
