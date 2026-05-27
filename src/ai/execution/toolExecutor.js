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
