import { Customer, ManualSection, Platform, User, UserRole } from '../types';
import { supabase } from './supabase';

const CUSTOMERS_KEY = 'socialcrm_customers';
const USERS_KEY = 'socialcrm_users';

// Initial Super Admin for LocalStorage fallback
const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: UserRole.SUPER_ADMIN,
    canViewAll: true,
    createdAt: Date.now(),
  }
];

const initialCustomers: Customer[] = [
  {
    id: '1',
    creatorId: '1', 
    name: '上海包车-李先生',
    contactInfo: 'wx: li_charter_sh',
    platform: Platform.XIAOHONGSHU,
    dealDate: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    lastTrackedDate: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    images: [],
    copywritings: [
      { id: 'c1', content: '✈️ 上海浦东/虹桥机场接送\n丰田埃尔法/别克GL8随时待命！\n✅ 专职司机，十年驾龄\n✅ 车内整洁，免费矿泉水\n✅ 举牌接机，延误免费等待\n#上海包车 #机场接送 #商务接待', createdAt: Date.now(), isAiGenerated: false }
    ],
    notes: '需要配儿童座椅，比较在意车内是否有烟味'
  }
];

// Helper to simulate network delay for local storage
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  // --- Auth & Users ---
  
  login: async (username: string, password: string): Promise<User | null> => {
    if (supabase) {
      // In a real app, use supabase.auth.signInWithPassword. 
      // For this specific 'custom user table' request:
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password) // Note: In prod, use Supabase Auth or hash passwords!
        .single();
      
      if (error || !data) return null;
      return {
        id: data.id,
        username: data.username,
        role: data.role as UserRole,
        canViewAll: data.can_view_all,
        createdAt: data.created_at
      };
    } else {
      await delay(500);
      const users = await db.getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      return user || null;
    }
  },

  getUsers: async (): Promise<User[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data.map((u: any) => ({
        id: u.id,
        username: u.username,
        role: u.role as UserRole,
        canViewAll: u.can_view_all,
        createdAt: u.created_at,
        password: u.password 
      }));
    } else {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : initialUsers;
    }
  },

  addUser: async (username: string, password: string): Promise<User> => {
    if (supabase) {
       // Check exists
       const { data: existing } = await supabase.from('users').select('id').eq('username', username).single();
       if (existing) throw new Error('用户名已存在');

       const newUser = {
         id: Date.now().toString(),
         username,
         password,
         role: UserRole.ADMIN,
         can_view_all: false,
         created_at: Date.now()
       };
       
       const { error } = await supabase.from('users').insert(newUser);
       if(error) throw error;

       return {
         ...newUser,
         canViewAll: newUser.can_view_all,
         createdAt: newUser.created_at
       } as User;

    } else {
      const users = await db.getUsers();
      if (users.find(u => u.username === username)) {
        throw new Error('用户名已存在');
      }
      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        role: UserRole.ADMIN,
        canViewAll: false,
        createdAt: Date.now(),
      };
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return newUser;
    }
  },

  deleteUser: async (userId: string) => {
    if (userId === '1') return; // Protect super admin
    if (supabase) {
      await supabase.from('users').delete().eq('id', userId);
    } else {
      let users = await db.getUsers();
      users = users.filter(u => u.id !== userId);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  updateUserPermission: async (userId: string, canViewAll: boolean) => {
    if (supabase) {
       await supabase.from('users').update({ can_view_all: canViewAll }).eq('id', userId);
    } else {
      const users = await db.getUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index !== -1) {
        users[index].canViewAll = canViewAll;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
  },

  // --- Customers ---
  
  getCustomers: async (currentUser: User): Promise<Customer[]> => {
    if (supabase) {
      let query = supabase.from('customers').select('*');
      
      // Permission logic
      if (currentUser.role !== UserRole.SUPER_ADMIN && !currentUser.canViewAll) {
         query = query.eq('creator_id', currentUser.id);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error("Supabase error:", error);
        return [];
      }
      
      return data.map((c: any) => ({
         id: c.id,
         creatorId: c.creator_id,
         name: c.name,
         contactInfo: c.contact_info,
         platform: c.platform,
         dealDate: c.deal_date,
         expiryDate: c.expiry_date,
         lastTrackedDate: c.last_tracked_date,
         images: c.images || [],
         copywritings: c.copywritings || [],
         notes: c.notes
      }));
    } else {
      await delay(300); // Simulate network
      const data = localStorage.getItem(CUSTOMERS_KEY);
      const allCustomers: Customer[] = data ? JSON.parse(data) : initialCustomers;

      if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.canViewAll) {
        return allCustomers;
      }
      return allCustomers.filter(c => c.creatorId === currentUser.id);
    }
  },

  saveCustomer: async (customer: Customer, currentUser: User) => {
    // Ensure creatorId is set
    const customerToSave = {
      ...customer,
      creatorId: customer.creatorId || currentUser.id
    };

    if (supabase) {
      const dbCustomer = {
         id: customerToSave.id,
         creator_id: customerToSave.creatorId,
         name: customerToSave.name,
         contact_info: customerToSave.contactInfo,
         platform: customerToSave.platform,
         deal_date: customerToSave.dealDate,
         expiry_date: customerToSave.expiryDate,
         last_tracked_date: customerToSave.lastTrackedDate,
         images: customerToSave.images,
         copywritings: customerToSave.copywritings,
         notes: customerToSave.notes
      };
      
      const { error } = await supabase.from('customers').upsert(dbCustomer);
      if (error) console.error("Save error", error);

    } else {
      await delay(200);
      const rawData = localStorage.getItem(CUSTOMERS_KEY);
      const customers: Customer[] = rawData ? JSON.parse(rawData) : initialCustomers;
      const index = customers.findIndex(c => c.id === customer.id);
      
      if (index >= 0) {
        customers[index] = customerToSave;
      } else {
        customers.push(customerToSave);
      }
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    }
  },

  deleteCustomer: async (id: string) => {
    if (supabase) {
      await supabase.from('customers').delete().eq('id', id);
    } else {
      const rawData = localStorage.getItem(CUSTOMERS_KEY);
      const customers: Customer[] = rawData ? JSON.parse(rawData) : initialCustomers;
      const newCustomers = customers.filter(c => c.id !== id);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(newCustomers));
    }
  },

  getManuals: (platform: Platform): ManualSection[] => {
    // Keeping manuals static/local for now as per simplicity, but could be DB-backed too
    if (platform === Platform.XIAOHONGSHU) {
      return [
        { id: 'm1', title: '小红书获客引流技巧', content: '1. 封面图一定要展示车型外观或豪华内饰。\n2. 标题带上地名+场景，如“上海迪士尼包车”。\n3. 评论区及时互动，引导私信。', type: 'guide' },
        { id: 'm2', title: '违规避坑指南', content: '1. 避免直接在笔记里发微信号，用“绿泡泡”或图片代替。\n2. 不要频繁私信相同内容，容易被禁言。', type: 'tip' }
      ];
    } else {
      return [
        { id: 'xm1', title: '闲鱼快速出单话术', content: '1. 强调“个人车源”或“一手价格”。\n2. 发布时选择“同城面交”增加曝光。\n3. 芝麻信用分很重要，展示信用极好。', type: 'guide' },
        { id: 'xm2', title: '交易安全提示', content: '1. 一定要在闲鱼平台内沟通和交易。\n2. 定金走闲鱼链接，不要直接转账。', type: 'tip' }
      ];
    }
  }
};