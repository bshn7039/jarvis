import { executeToolAction, TOOL_PERMISSIONS, PERMISSION_LEVELS, TOOL_ALIASES } from '../tools/toolRegistry';
import { useActivityStore } from '../../store/activityStore';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { useFinanceStore } from '../../store/financeStore';
import { useMutualFundStore } from '../../store/mutualFundStore';

/**
 * Validates, executes, and logs AI tool requests.
 */
export async function executeAiTool(name, args) {
  const resolvedName = TOOL_ALIASES[name] || name;
  const permission = TOOL_PERMISSIONS[resolvedName];

  if (!permission) {
    throw new Error(`Execution error: Tool '${name}' is not registered in the operational engine.`);
  }

  // 1. Enforce Security boundaries (Phase 17)
  if (permission === PERMISSION_LEVELS.SYSTEM_RESTRICTED) {
    throw new Error(`Security Policy Violation: '${name}' is restricted by system security policies.`);
  }

  // 2. Validate existence of entities for updates or deletes
  if (resolvedName === 'update_task' || resolvedName === 'delete_task' || resolvedName === 'complete_task') {
    if (!args.id) {
      throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    }
    const taskStore = useTaskStore.getState();
    const taskExists = (taskStore.tasks || []).some(t => t.id === args.id);
    if (!taskExists) {
      throw new Error(`Validation Error: Task ID '${args.id}' does not exist in the active store.`);
    }
  }

  if (resolvedName === 'delete_goal') {
    if (!args.id) {
      throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    }
    const goalStore = useGoalStore.getState();
    const goalExists = (goalStore.goals || []).some(g => g.id === args.id);
    if (!goalExists) {
      throw new Error(`Validation Error: Goal ID '${args.id}' does not exist in the active store.`);
    }
  }

  if (resolvedName === 'delete_finance_transaction' || resolvedName === 'update_finance_transaction') {
    if (!args.id) {
      throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    }
    const financeStore = useFinanceStore.getState();
    const transactionExists = (financeStore.transactions || []).some(t => t.id === args.id);
    if (!transactionExists) {
      throw new Error(`Validation Error: Transaction ID '${args.id}' does not exist in the active store.`);
    }
  }

  if (resolvedName === 'delete_mutual_fund' || resolvedName === 'delete_mutual_fund_purchase' || resolvedName === 'add_mutual_fund_purchase') {
    if (!args.fundId) {
      throw new Error(`Validation Error: Missing required field 'fundId' for action '${name}'.`);
    }
    const mfStore = useMutualFundStore.getState();
    const fund = (mfStore.funds || []).find(f => f.id === args.fundId);
    if (!fund) {
      throw new Error(`Validation Error: Mutual Fund with ID '${args.fundId}' does not exist in the active store.`);
    }

    if (resolvedName === 'delete_mutual_fund_purchase') {
      if (!args.purchaseId) {
        throw new Error(`Validation Error: Missing required field 'purchaseId' for action '${name}'.`);
      }
      const purchaseExists = (fund.purchases || []).some(p => p.id === args.purchaseId);
      if (!purchaseExists) {
        throw new Error(`Validation Error: Purchase with ID '${args.purchaseId}' does not exist in Mutual Fund '${fund.schemeName}'.`);
      }
    }
  }

  // Academic operational existence checks
  if (resolvedName === 'update_academic_subject' || resolvedName === 'delete_academic_subject') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useAcademicStore } = await import('../../store/academicStore');
    const exists = (useAcademicStore.getState().subjects || []).some(s => s.id === args.id);
    if (!exists) throw new Error(`Validation Error: Subject ID '${args.id}' does not exist.`);
  }

  if (resolvedName === 'update_academic_skill' || resolvedName === 'delete_academic_skill') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useAcademicStore } = await import('../../store/academicStore');
    const exists = (useAcademicStore.getState().skills || []).some(s => s.id === args.id);
    if (!exists) throw new Error(`Validation Error: Skill ID '${args.id}' does not exist.`);
  }

  if (resolvedName === 'update_academic_project' || resolvedName === 'delete_academic_project') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useAcademicStore } = await import('../../store/academicStore');
    const exists = (useAcademicStore.getState().projects || []).some(p => p.id === args.id);
    if (!exists) throw new Error(`Validation Error: Project ID '${args.id}' does not exist.`);
  }

  if (resolvedName === 'update_academic_tech_stack' || resolvedName === 'delete_academic_tech_stack') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useAcademicStore } = await import('../../store/academicStore');
    const exists = (useAcademicStore.getState().techStack || []).some(t => t.id === args.id);
    if (!exists) throw new Error(`Validation Error: Tech stack ID '${args.id}' does not exist.`);
  }

  if (resolvedName === 'update_academic_certification' || resolvedName === 'delete_academic_certification') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useAcademicStore } = await import('../../store/academicStore');
    const exists = (useAcademicStore.getState().certifications || []).some(c => c.id === args.id);
    if (!exists) throw new Error(`Validation Error: Certification ID '${args.id}' does not exist.`);
  }

  // Personal Hub & Self Care operational existence checks
  if (resolvedName === 'update_personal_item' || resolvedName === 'delete_personal_item') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    if (!args.categoryType) throw new Error(`Validation Error: Missing required field 'categoryType' for action '${name}'.`);
    const { usePersonalStore } = await import('../../store/personalStore');
    const list = usePersonalStore.getState()[args.categoryType] || [];
    const exists = list.some(i => i.id === args.id);
    if (!exists) throw new Error(`Validation Error: Personal item ID '${args.id}' under category '${args.categoryType}' does not exist.`);
  }

  if (resolvedName === 'update_self_care_routine' || resolvedName === 'delete_self_care_routine' || resolvedName === 'complete_self_care_routine') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useSelfCareStore } = await import('../../store/selfCareStore');
    const exists = (useSelfCareStore.getState().routines || []).some(r => r.id === args.id);
    if (!exists) throw new Error(`Validation Error: Self-care routine ID '${args.id}' does not exist.`);
  }

  if (resolvedName === 'update_goal') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const goalStore = useGoalStore.getState();
    const exists = (goalStore.goals || []).some(g => g.id === args.id);
    if (!exists) throw new Error(`Validation Error: Goal ID '${args.id}' does not exist in the active store.`);
  }

  if (resolvedName === 'update_journal_entry' || resolvedName === 'delete_journal_entry') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useJournalStore } = await import('../../store/journalStore');
    const exists = (useJournalStore.getState().entries || []).some(e => e.id === args.id);
    if (!exists) throw new Error(`Validation Error: Journal entry ID '${args.id}' does not exist.`);
  }

  if (resolvedName === 'update_crm_entry' || resolvedName === 'delete_crm_entry') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useCrmStore } = await import('../../store/crmStore');
    const exists = (useCrmStore.getState().contacts || []).some(c => c.id === args.id);
    if (!exists) throw new Error(`Validation Error: CRM contact ID '${args.id}' does not exist.`);
  }

  if (resolvedName === 'delete_fitness_log' || resolvedName === 'update_fitness_log') {
    if (!args.id) throw new Error(`Validation Error: Missing required field 'id' for action '${name}'.`);
    const { useFitnessStore } = await import('../../store/fitnessStore');
    const state = useFitnessStore.getState();
    const allLogs = [...(state.workouts || []), ...(state.meals || []), ...(state.hydrationLogs || [])];
    const exists = allLogs.some(l => l.id === args.id);
    if (!exists) throw new Error(`Validation Error: Fitness log ID '${args.id}' does not exist.`);
  }

  if (resolvedName === 'update_roadmap' || resolvedName === 'delete_roadmap' || resolvedName === 'add_roadmap_log') {
    const lookupId = args.id || args.roadmapId;
    if (!lookupId) throw new Error(`Validation Error: Missing required roadmap ID for action '${name}'.`);
    const { usePersonalRoadmapStore } = await import('../../store/personalRoadmapStore');
    const exists = (usePersonalRoadmapStore.getState().roadmaps || []).some(r => r.id === lookupId);
    if (!exists) throw new Error(`Validation Error: Roadmap ID '${lookupId}' does not exist.`);
  }

  // 3. Perform execution
  const result = await executeToolAction(name, args);

  // 4. Log AI Activity (Phase 12)
  if (result && result.success) {
    try {
      const activityStore = useActivityStore.getState();
      let activityAction = `AI proposed ${resolvedName}`;
      let entityType = 'ai';
      let entityId = result.entityId || args.id || 'system';

      if (resolvedName === 'create_task') {
        activityAction = `AI created task: "${args.title}"`;
        entityType = 'task';
      } else if (resolvedName === 'update_task') {
        activityAction = `AI updated task details`;
        entityType = 'task';
      } else if (resolvedName === 'complete_task') {
        activityAction = `AI completed task: "${args.title || 'Task'}"`;
        entityType = 'task';
      } else if (resolvedName === 'create_goal') {
        activityAction = `AI created goal: "${args.title}"`;
        entityType = 'goal';
      } else if (resolvedName === 'create_journal_entry') {
        activityAction = `AI created journal entry: "${args.title}"`;
        entityType = 'journal';
      } else if (resolvedName === 'log_meal') {
        activityAction = `AI logged meal: "${args.title}"`;
        entityType = 'fitness';
      } else if (resolvedName === 'log_workout') {
        activityAction = `AI logged workout: "${args.title}"`;
        entityType = 'fitness';
      } else if (resolvedName === 'create_finance_transaction') {
        activityAction = `AI recorded ${args.type} transaction: "${args.title}"`;
        entityType = 'finance';
      } else if (resolvedName === 'bulk_create_finance_transactions') {
        activityAction = `AI bulk recorded ${(args.transactions || []).length} transaction(s)`;
        entityType = 'finance';
      } else if (resolvedName === 'update_finance_transaction') {
        activityAction = `AI updated transaction ID: ${args.id}`;
        entityType = 'finance';
      } else if (resolvedName === 'delete_finance_transaction') {
        activityAction = `AI deleted transaction ID: ${args.id}`;
        entityType = 'finance';
      } else if (resolvedName === 'create_savings_transfer') {
        activityAction = `AI logged savings transfer of ₹${args.amount} from '${args.fromAccount}'`;
        entityType = 'finance';
      } else if (resolvedName === 'create_schedule') {
        activityAction = `AI scheduled event: "${args.title}"`;
        entityType = 'schedule';
      } else if (resolvedName === 'create_crm_entry') {
        activityAction = `AI logged CRM contact: "${args.name}"`;
        entityType = 'crm';
      } else if (resolvedName === 'create_mutual_fund') {
        activityAction = `AI logged new mutual fund: "${args.schemeName}"`;
        entityType = 'finance';
        entityId = result.entityId || 'system';
      } else if (resolvedName === 'add_mutual_fund_purchase') {
        activityAction = `AI added purchase of ₹${args.purchase?.amount} to mutual fund ID: ${args.fundId}`;
        entityType = 'finance';
        entityId = args.fundId;
      } else if (resolvedName === 'delete_mutual_fund') {
        activityAction = `AI deleted mutual fund ID: ${args.fundId}`;
        entityType = 'finance';
        entityId = args.fundId;
      } else if (resolvedName === 'delete_mutual_fund_purchase') {
        activityAction = `AI deleted purchase ID: ${args.purchaseId} from mutual fund ID: ${args.fundId}`;
        entityType = 'finance';
        entityId = args.fundId;
      } else if (resolvedName === 'create_academic_subject') {
        activityAction = `AI created academic subject: "${args.name}"`;
        entityType = 'academic';
      } else if (resolvedName === 'update_academic_subject') {
        activityAction = `AI updated academic subject details`;
        entityType = 'academic';
      } else if (resolvedName === 'delete_academic_subject') {
        activityAction = `AI deleted academic subject`;
        entityType = 'academic';
      } else if (resolvedName === 'create_academic_skill') {
        activityAction = `AI logged placement skill target: "${args.name}"`;
        entityType = 'academic';
      } else if (resolvedName === 'update_academic_skill') {
        activityAction = `AI updated placement skill details`;
        entityType = 'academic';
      } else if (resolvedName === 'delete_academic_skill') {
        activityAction = `AI deleted placement skill`;
        entityType = 'academic';
      } else if (resolvedName === 'create_academic_project') {
        activityAction = `AI logged portfolio project: "${args.name}"`;
        entityType = 'academic';
      } else if (resolvedName === 'update_academic_project') {
        activityAction = `AI updated portfolio project details`;
        entityType = 'academic';
      } else if (resolvedName === 'delete_academic_project') {
        activityAction = `AI deleted portfolio project`;
        entityType = 'academic';
      } else if (resolvedName === 'create_academic_tech_stack') {
        activityAction = `AI logged technology target: "${args.name}"`;
        entityType = 'academic';
      } else if (resolvedName === 'update_academic_tech_stack') {
        activityAction = `AI updated technology target details`;
        entityType = 'academic';
      } else if (resolvedName === 'delete_academic_tech_stack') {
        activityAction = `AI deleted technology target`;
        entityType = 'academic';
      } else if (resolvedName === 'create_academic_dsa') {
        activityAction = `AI logged solved DSA question: "${args.title}"`;
        entityType = 'academic';
      } else if (resolvedName === 'create_academic_certification') {
        activityAction = `AI registered course certification: "${args.course}"`;
        entityType = 'academic';
      } else if (resolvedName === 'update_academic_certification') {
        activityAction = `AI updated course certification details`;
        entityType = 'academic';
      } else if (resolvedName === 'delete_academic_certification') {
        activityAction = `AI deleted course certification`;
        entityType = 'academic';
      } else if (resolvedName === 'create_personal_item') {
        activityAction = `AI added personal ${args.categoryType} item: "${args.title}"`;
        entityType = 'personal';
      } else if (resolvedName === 'update_personal_item') {
        activityAction = `AI updated personal ${args.categoryType} item`;
        entityType = 'personal';
      } else if (resolvedName === 'delete_personal_item') {
        activityAction = `AI deleted personal ${args.categoryType} item`;
        entityType = 'personal';
      } else if (resolvedName === 'create_self_care_routine') {
        activityAction = `AI created self-care routine: "${args.title}"`;
        entityType = 'personal';
      } else if (resolvedName === 'update_self_care_routine') {
        activityAction = `AI updated self-care routine`;
        entityType = 'personal';
      } else if (resolvedName === 'delete_self_care_routine') {
        activityAction = `AI deleted self-care routine`;
        entityType = 'personal';
      } else if (resolvedName === 'complete_self_care_routine') {
        activityAction = `AI logged self-care completion`;
        entityType = 'personal';
      } else if (resolvedName === 'update_goal') {
        activityAction = `AI updated goal details`;
        entityType = 'goal';
      } else if (resolvedName === 'update_journal_entry') {
        activityAction = `AI updated journal entry`;
        entityType = 'journal';
      } else if (resolvedName === 'delete_journal_entry') {
        activityAction = `AI deleted journal entry ID: ${args.id}`;
        entityType = 'journal';
      } else if (resolvedName === 'update_crm_entry') {
        activityAction = `AI updated CRM contact`;
        entityType = 'crm';
      } else if (resolvedName === 'delete_crm_entry') {
        activityAction = `AI deleted CRM contact ID: ${args.id}`;
        entityType = 'crm';
      } else if (resolvedName === 'delete_fitness_log') {
        activityAction = `AI deleted fitness log ID: ${args.id}`;
        entityType = 'fitness';
      } else if (resolvedName === 'update_fitness_log') {
        activityAction = `AI updated ${args.logType} log ID: ${args.id}`;
        entityType = 'fitness';
      } else if (resolvedName === 'create_roadmap') {
        activityAction = `AI created personal roadmap: "${args.title}"`;
        entityType = 'personal';
      } else if (resolvedName === 'update_roadmap') {
        activityAction = `AI updated personal roadmap`;
        entityType = 'personal';
      } else if (resolvedName === 'delete_roadmap') {
        activityAction = `AI deleted personal roadmap ID: ${args.id}`;
        entityType = 'personal';
      } else if (resolvedName === 'add_roadmap_log') {
        activityAction = `AI logged roadmap entry under key '${args.logKey}'`;
        entityType = 'personal';
      }

      await activityStore.logActivity({
        type: 'ai_action',
        action: activityAction,
        entityType,
        entityId,
        metadata: {
          tool: resolvedName,
          args,
          result: result.message
        },
        severity: 'info'
      });
    } catch (actErr) {
      console.warn('[ToolExecutor] Failed to log activity for AI action:', actErr);
    }
  }

  return result;
}
